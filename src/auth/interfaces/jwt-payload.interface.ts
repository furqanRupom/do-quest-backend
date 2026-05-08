
export interface JwtPayload {
    sub: string ;
    username: string;
    email: string;
    role: string;
    userStripeId:string | null;
}
