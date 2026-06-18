import { Request } from 'express';
import { UserRole } from '@prisma/client';

// ── Authenticated request ──────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    campusId?: string; // set for admin users
  };
}

// ── Pagination ─────────────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ── API Response ───────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ── JWT Payload ────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;       // user id
  role: UserRole;
  campusId?: string;
  iat?: number;
  exp?: number;
}

// ── Socket events ──────────────────────────────────────────────
export interface NewOrderEvent {
  orderId: string;
  campusId: string;
  totalAmount: number;
  customerPhone: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  userId: string;
  campusId: string;
  status: string;
  updatedAt: string;
}
