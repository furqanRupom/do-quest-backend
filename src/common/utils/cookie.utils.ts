import { Response } from 'express';

export const setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,
) => {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, 
        path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, 
        path: '/',
    });


};