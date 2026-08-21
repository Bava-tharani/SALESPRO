import { Request, Response, NextFunction } from 'express';
import { BackendDatabase } from './db';
import { User, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  organizationId?: string;
}

export class AuthMiddleware {
  /**
   * Identifies user from headers (e.g. x-user-id or Authorization Bearer)
   */
  public static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    const userRole = (req.headers['x-user-role'] as string) || (req.query.userRole as string);

    if (userId) {
      let user = BackendDatabase.users.find((u) => u.id === userId);
      if (!user && (userRole === 'manager' || userRole === 'salesperson')) {
        // Dynamic provisioned user
        user = {
          id: userId,
          name: (req.headers['x-user-name'] as string) || 'Authenticated User',
          email: (req.headers['x-user-email'] as string) || `${userId}@salescallpro.ai`,
          role: userRole as UserRole,
          status: 'active',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        BackendDatabase.users.push(user);
      }

      if (user) {
        req.user = user;
        req.organizationId = BackendDatabase.organization.id;
        return next();
      }
    }

    // Default fallback to first manager if not specified in dev
    req.user = BackendDatabase.users[0];
    req.organizationId = BackendDatabase.organization.id;
    next();
  }

  /**
   * Enforces Manager Role Only
   */
  public static requireManager(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 'manager') {
      BackendDatabase.logAudit({
        userId: req.user?.id || 'anonymous',
        userName: req.user?.name || 'Unauthorized User',
        userRole: req.user?.role || 'salesperson',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'REPORT',
        resourceId: req.originalUrl,
        metadata: { status: 403, reason: 'Manager role required' }
      });
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Access Denied: This resource requires Sales Manager executive privileges.'
      });
    }
    next();
  }

  /**
   * Enforces that a salesperson can ONLY access their own resource
   */
  public static enforceOwnership(paramKey: string = 'salespersonId') {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const targetId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey];

      // If user is manager, they can access any salesperson in the organization
      if (req.user?.role === 'manager') {
        return next();
      }

      // If user is salesperson, targetId MUST match their own ID
      if (req.user?.role === 'salesperson' && targetId && targetId !== req.user.id) {
        BackendDatabase.logAudit({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'CROSS_SALESPERSON_ACCESS_BLOCKED',
          resourceType: 'CALL',
          resourceId: String(targetId),
          metadata: { status: 403, requestedPath: req.originalUrl }
        });
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Access Denied: A salesperson is strictly prohibited from accessing another representative\'s calls or records.'
        });
      }

      next();
    };
  }
}
