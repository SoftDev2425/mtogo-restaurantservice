import { Request } from 'express';

export interface CustomRequest extends Request {
  email?: string;
  role?: string;
  userId?: string;
}
