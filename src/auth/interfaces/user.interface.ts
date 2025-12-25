import { ROLE } from "../constants/constant";

export interface IUser {
    name: string;
    username: string;
    email: string;
    password: string;
    role: typeof ROLE.ADMIN | typeof ROLE.USER;
    location?: string;
    company?: string;
    socialLinks?: string[];
}