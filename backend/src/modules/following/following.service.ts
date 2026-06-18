import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { getPaginationParams, paginate } from '../../utils/response';

export class FollowingService {
  async getFollowing(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const where = { followerId: userId };

    const [following, total] = await Promise.all([
      prisma.follower.findMany({
        where,
        include: {
          following: { select: { id: true, name: true, profileImageUrl: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follower.count({ where }),
    ]);

    return paginate(following.map((f) => f.following), total, { page, limit, skip });
  }

  async getFollowers(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query);

    const where = { followingId: userId };

    const [followers, total] = await Promise.all([
      prisma.follower.findMany({
        where,
        include: {
          follower: { select: { id: true, name: true, profileImageUrl: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follower.count({ where }),
    ]);

    return paginate(followers.map((f) => f.follower), total, { page, limit, skip });
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new AppError('Cannot follow yourself', 400);

    const target = await prisma.user.findUnique({ where: { id: followingId }, select: { id: true } });
    if (!target) throw new AppError('User not found', 404);

    const existing = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) throw new AppError('Already following this user', 409);

    return prisma.follower.create({
      data: { followerId, followingId },
      include: {
        following: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) throw new AppError('Not following this user', 404);

    await prisma.follower.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { unfollowed: true };
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const records = await prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return records.map((r) => r.followingId);
  }
}

export const followingService = new FollowingService();
