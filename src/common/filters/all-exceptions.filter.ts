
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorName = 'InternalServerError';
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'string' ? res : (res as object)['message'] || exception.message;
            errorName = exception.name;
        }
        else if (exception instanceof MongooseError.ValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = Object.values(exception.errors).map((err) => err.message);
            errorName = 'ValidationError';
        }
        else if (exception instanceof MongooseError.CastError) {
            status = HttpStatus.BAD_REQUEST;
            message = `Invalid ${exception.path}: ${exception.value}`;
            errorName = 'CastError';
        }
        else if (
            exception &&
            typeof exception === 'object' &&
            'code' in exception &&
            (exception as any).code === 11000 &&
            'keyValue' in exception &&
            (exception as any).keyValue
        ) {
            status = HttpStatus.CONFLICT;
            const keyValue = (exception as any).keyValue;
            const field = Object.keys(keyValue)[0];
            const value = keyValue[field];
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
            errorName = 'DuplicateKeyError';
        }
        else {
            this.logger.error('Unexpected error:', exception);
        }

        response.status(status).json({
            statusCode: status,
            message,  
            error: errorName,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });
    }
}