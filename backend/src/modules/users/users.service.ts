import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';
import type { UpdateProfileDto } from './users.validators';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true, name: true, email: true, phoneNumber: true,
        role: true, status: true, profileImageUrl: true,
        phoneVerified: true, emailVerified: true,
        lastLoginAt: true, createdAt: true,
        campusAdminOf: {
          where: { isActive: true },
          select: { campus: { select: { id: true, name: true, city: true } } },
        },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.profileImageUrl !== undefined && { profileImageUrl: dto.profileImageUrl }),
      },
      select: {
        id: true, name: true, email: true, phoneNumber: true,
        role: true, profileImageUrl: true, updatedAt: true,
      },
    });
    return updated;
  }

  async getUserOrders(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId, deletedAt: null },
        include: {
          items: {
            select: {
              id: true, quantity: true, priceAtTime: true, productNameSnapshot: true,
            },
          },
          campus: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);
    return paginate(orders, total, { page, limit, skip });
  }

  async listUsers(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);
    const role = query.role as string | undefined;
    const status = query.status as string | undefined;

    const where = {
      deletedAt: null,
      ...(role && { role: role as never }),
      ...(status && { status: status as never }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phoneNumber: true,
          role: true, status: true, createdAt: true, lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    return paginate(users, total, { page, limit, skip });
  }

  async blockUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'blocked' },
      select: { id: true, status: true },
    });
  }
}

export const usersService = new UsersService();
