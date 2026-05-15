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

        let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorName = 'InternalServerError';

        const err = exception as any;

        // -------------------------
        // HTTP EXCEPTIONS
        // -------------------------
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (Array.isArray((res as any).message)) {
                message = (res as any).message;
            } else if ((res as any).message) {
                message = (res as any).message;
            } else {
                message = exception.message;
            }

            errorName = exception.name;
        }

        // -------------------------
        // MONGOOSE VALIDATION ERROR
        // -------------------------
        else if (exception instanceof MongooseError.ValidationError) {
            status = HttpStatus.BAD_REQUEST;

            message = Object.values(exception.errors)
                .map((err) => err.message)
                .join(', ');

            errorName = 'ValidationError';
        }

        // -------------------------
        // MONGOOSE CAST ERROR
        // -------------------------
        else if (exception instanceof MongooseError.CastError) {
            status = HttpStatus.BAD_REQUEST;

            message = `Invalid ${exception.path}: ${exception.value}`;

            errorName = 'CastError';
        }

        // -------------------------
        // DUPLICATE KEY ERROR (MongoDB 11000)
        // -------------------------
        else if (err?.code === 11000) {
            status = HttpStatus.CONFLICT;

            const keyValue = err.keyValue || {};
            const field = Object.keys(keyValue)[0];

            message = field
                ? `${field} '${keyValue[field]}' already exists`
                : 'Duplicate key error';

            errorName = 'DuplicateKeyError';
        }

        // -------------------------
        // UNKNOWN ERROR
        // -------------------------
        else {
            this.logger.error('Unexpected error:', exception);
        }

        // -------------------------
        // RESPONSE FORMAT
        // -------------------------
        response.status(status).json({
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            error: errorName,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });
    }
}
