import mongoose from "mongoose";
import { ROLE } from "../constants/constant";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    username: string;
    email: string;
    role: typeof ROLE.ADMIN | typeof ROLE.USER;
    location?: string;
    company?: string;
    socialLinks?: string[];
}