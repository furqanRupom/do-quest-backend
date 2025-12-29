import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AuthRequest extends Request {
    user: JwtPayload;
}
