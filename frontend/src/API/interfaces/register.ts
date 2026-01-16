import { AuthResponse } from "../types/auth";

export interface RegisterStrategy<T> {
  register(data: T): Promise<AuthResponse>;
}
