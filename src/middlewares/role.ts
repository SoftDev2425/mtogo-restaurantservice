import { CustomRequest } from '../types/CustomRequest';
import { Response, NextFunction } from 'express';

export const requireRoles = (allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role.toLowerCase())) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient permissions' });
    }
    next(); // User has one of the allowed roles, proceed to the next middleware/route handler
  };
};

export const requireCustomer = requireRoles(['customer']);
export const requireRestaurant = requireRoles(['restaurant']);
export const requireAdmin = requireRoles(['admin']);
