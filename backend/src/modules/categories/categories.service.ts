import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/error.middleware';
import { redisService, CacheKeys } from '../../services/redis.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './categories.validators';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'category';
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let counter = 0;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) return slug;
    counter++;
    slug = `${base}-${counter}`;
  }
}

export class CategoriesService {
  async create(dto: CreateCategoryDto, creatorId: string) {
    const slug = await uniqueSlug(slugify(dto.name));
    const cat = await prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        iconUrl: dto.iconUrl ?? null,
        coverImage: dto.coverImage ?? null,
        sortOrder: dto.sortOrder ?? 0,
        visibility: dto.visibility ?? 'PUBLIC',
        isActive: dto.isActive ?? true,
        createdBy: creatorId,
      },
    });
    await redisService.delPattern('categories:*');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Category not found', 404);

    const data: any = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await uniqueSlug(slugify(dto.name), id);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.iconUrl !== undefined) data.iconUrl = dto.iconUrl;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const cat = await prisma.category.update({ where: { id }, data });
    await redisService.delPattern('categories:*');
    return cat;
  }

  async delete(id: string) {
    const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Category not found', 404);
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await redisService.delPattern('categories:*');
  }

  async list(filters?: { isActive?: boolean; visibility?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.visibility) where.visibility = filters.visibility;
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    const cats = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return cats.map(c => ({
      ...c,
      productCount: c._count.products,
      _count: undefined,
    }));
  }

  async getPublic() {
    const cached = await redisService.get(CacheKeys.categories());
    if (cached) return cached;

    const cats = await prisma.category.findMany({
      where: { isActive: true, visibility: 'PUBLIC', deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });

    const result = cats.map(c => ({
      ...c,
      productCount: c._count.products,
      _count: undefined,
    }));

    await redisService.set(CacheKeys.categories(), result, 900); // 15 min cache
    return result;
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      items.map(item =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    await redisService.delPattern('categories:*');
  }

  async toggleStatus(id: string, isActive: boolean) {
    const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Category not found', 404);
    const cat = await prisma.category.update({ where: { id }, data: { isActive } });
    await redisService.delPattern('categories:*');
    return cat;
  }
}

export const categoriesService = new CategoriesService();
