import { AuthResponse } from "../types/auth";

export interface LoginStrategy<T> {
    login(data: T): Promise<AuthResponse>;
}