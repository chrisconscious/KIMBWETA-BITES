import { prisma } from '../../database/prisma';

export class SettingsService {
  async getPublic() {
    const settings = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  }

  async getAll() {
    return prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async set(key: string, value: string) {
    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

export const settingsService = new SettingsService();
