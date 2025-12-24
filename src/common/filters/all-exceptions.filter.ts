
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface ValidationError {
    errors: Record<string, { message: string }>;
}

interface CastError extends MongooseError.CastError {
    path: string;
    value: any;
}

interface DuplicateKeyError extends MongoError {
    code: 11000;
    keyValue: Record<string, any>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorName: string = 'InternalServerError';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message =
                typeof res === 'string'
                    ? res
                    : (res as any).message || exception.message;
            errorName = exception.name;
        }
        else if (
            exception instanceof MongooseError.ValidationError ||
            (exception as ValidationError)?.errors
        ) {
            status = HttpStatus.BAD_REQUEST;
            const validationError = exception as MongooseError.ValidationError;
            message = Object.values(validationError.errors).map((err) => err.message);
            errorName = 'ValidationError';
        }
        else if (exception instanceof MongooseError.CastError) {
            status = HttpStatus.BAD_REQUEST;
            const castError = exception as CastError;
            message = `Invalid ${castError.path}: ${castError.value}`;
            errorName = 'CastError';
        }
        else if ((exception as DuplicateKeyError)?.code === 11000) {
            status = HttpStatus.CONFLICT;
            const dupError = exception as DuplicateKeyError;
            const field = Object.keys(dupError.keyValue)[0];
            const value = dupError.keyValue[field];
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
            errorName = 'DuplicateKeyError';
        }
        else {
            if ((exception as MongoError)?.code) {
                this.logger.error(`MongoDB Error (code ${(exception as MongoError).code}):`, exception);
            } else {
                this.logger.error('Unexpected error:', exception);
            }
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: errorName,
            message,
        });
    }
}