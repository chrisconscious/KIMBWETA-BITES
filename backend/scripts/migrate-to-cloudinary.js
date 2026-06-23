/**
 * Migration script: Move existing local file references to Cloudinary URLs.
 *
 * Usage:
 *   1. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 *   2. node scripts/migrate-to-cloudinary.js
 *
 * What it does:
 *   - Scans the database for all image URL fields that start with /uploads/
 *   - Reads the local file (if it still exists)
 *   - Uploads to Cloudinary
 *   - Updates the database record with the Cloudinary URL
 *
 * NOTE: On Render, local files are ephemeral. If the files have already been
 * deleted, this script will log a warning and skip. The important thing is
 * that ALL NEW uploads go to Cloudinary from now on.
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_BASE = process.env.UPLOAD_DIR
  ? (path.isAbsolute(process.env.UPLOAD_DIR)
    ? process.env.UPLOAD_DIR
    : path.resolve(process.cwd(), process.env.UPLOAD_DIR))
  : path.resolve(process.cwd(), 'uploads');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function uploadFileToCloudinary(filePath, folder) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠  File not found: ${filePath} — skipping`);
      return null;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `kimbweta/${folder}`,
      resource_type: 'auto',
    });
    console.log(`  ✓ Uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  ✗ Failed to upload ${filePath}:`, err.message);
    return null;
  }
}

function localPathFromUrl(url) {
  if (!url || !url.startsWith('/uploads/')) return null;
  const relativePath = url.replace('/uploads/', '');
  const fullPath = path.join(UPLOAD_BASE, relativePath);
  console.log(`  Looking for: ${fullPath}`);
  return fullPath;
}

async function migrateSettings() {
  console.log('\n📋 Migrating Site Settings...');
  const settings = await prisma.siteSetting.findMany({
    where: {
      OR: [
        { key: 'site_logo', value: { startsWith: '/uploads/' } },
        { key: 'preloader_logo', value: { startsWith: '/uploads/' } },
        { key: 'favicon', value: { startsWith: '/uploads/' } },
      ],
    },
  });

  for (const setting of settings) {
    console.log(`  Processing ${setting.key}: ${setting.value}`);
    const localPath = localPathFromUrl(setting.value);
    if (!localPath) continue;
    const url = await uploadFileToCloudinary(localPath, 'settings');
    if (url) {
      await prisma.siteSetting.update({
        where: { id: setting.id },
        data: { value: url },
      });
      console.log(`  ✓ Updated ${setting.key} → ${url}`);
    }
  }
}

async function migrateCategories() {
  console.log('\n📋 Migrating Category Icons...');
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { iconUrl: { startsWith: '/uploads/' } },
        { coverImage: { startsWith: '/uploads/' } },
      ],
    },
  });

  for (const cat of categories) {
    if (cat.iconUrl && cat.iconUrl.startsWith('/uploads/')) {
      console.log(`  Processing category ${cat.id} icon: ${cat.iconUrl}`);
      const localPath = localPathFromUrl(cat.iconUrl);
      if (localPath) {
        const url = await uploadFileToCloudinary(localPath, 'categories');
        if (url) {
          await prisma.category.update({
            where: { id: cat.id },
            data: { iconUrl: url },
          });
          console.log(`  ✓ Updated category ${cat.id} icon`);
        }
      }
    }
    if (cat.coverImage && cat.coverImage.startsWith('/uploads/')) {
      console.log(`  Processing category ${cat.id} cover: ${cat.coverImage}`);
      const localPath = localPathFromUrl(cat.coverImage);
      if (localPath) {
        const url = await uploadFileToCloudinary(localPath, 'categories');
        if (url) {
          await prisma.category.update({
            where: { id: cat.id },
            data: { coverImage: url },
          });
          console.log(`  ✓ Updated category ${cat.id} cover`);
        }
      }
    }
  }
}

async function migrateProducts() {
  console.log('\n📋 Migrating Product Images...');
  const products = await prisma.product.findMany({
    where: { imageUrl: { startsWith: '/uploads/' } },
  });

  for (const product of products) {
    console.log(`  Processing product ${product.id}: ${product.imageUrl}`);
    const localPath = localPathFromUrl(product.imageUrl);
    if (!localPath) continue;
    const url = await uploadFileToCloudinary(localPath, 'products');
    if (url) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: url },
      });
      console.log(`  ✓ Updated product ${product.id}`);
    }
  }
}

async function migrateAds() {
  console.log('\n📋 Migrating Ad Images/Videos...');
  const ads = await prisma.ad.findMany({
    where: {
      OR: [
        { imageUrl: { startsWith: '/uploads/' } },
        { videoUrl: { startsWith: '/uploads/' } },
      ],
    },
  });

  for (const ad of ads) {
    if (ad.imageUrl && ad.imageUrl.startsWith('/uploads/')) {
      console.log(`  Processing ad ${ad.id} image: ${ad.imageUrl}`);
      const localPath = localPathFromUrl(ad.imageUrl);
      if (localPath) {
        const url = await uploadFileToCloudinary(localPath, 'ads');
        if (url) {
          await prisma.ad.update({
            where: { id: ad.id },
            data: { imageUrl: url },
          });
          console.log(`  ✓ Updated ad ${ad.id} image`);
        }
      }
    }
    if (ad.videoUrl && ad.videoUrl.startsWith('/uploads/')) {
      console.log(`  Processing ad ${ad.id} video: ${ad.videoUrl}`);
      const localPath = localPathFromUrl(ad.videoUrl);
      if (localPath) {
        const url = await uploadFileToCloudinary(localPath, 'ads');
        if (url) {
          await prisma.ad.update({
            where: { id: ad.id },
            data: { videoUrl: url },
          });
          console.log(`  ✓ Updated ad ${ad.id} video`);
        }
      }
    }
  }
}

async function migrateUsers() {
  console.log('\n📋 Migrating User Profile Images...');
  const users = await prisma.user.findMany({
    where: { profileImageUrl: { startsWith: '/uploads/' } },
  });

  for (const user of users) {
    console.log(`  Processing user ${user.id}: ${user.profileImageUrl}`);
    const localPath = localPathFromUrl(user.profileImageUrl);
    if (!localPath) continue;
    const url = await uploadFileToCloudinary(localPath, 'profiles');
    if (url) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImageUrl: url },
      });
      console.log(`  ✓ Updated user ${user.id}`);
    }
  }
}

async function migrateCollections() {
  console.log('\n📋 Migrating Collection Cover Images...');
  const collections = await prisma.collection.findMany({
    where: { coverImage: { startsWith: '/uploads/' } },
  });

  for (const collection of collections) {
    console.log(`  Processing collection ${collection.id}: ${collection.coverImage}`);
    const localPath = localPathFromUrl(collection.coverImage);
    if (!localPath) continue;
    const url = await uploadFileToCloudinary(localPath, 'collections');
    if (url) {
      await prisma.collection.update({
        where: { id: collection.id },
        data: { coverImage: url },
      });
      console.log(`  ✓ Updated collection ${collection.id}`);
    }
  }
}

async function migrateCampuses() {
  console.log('\n📋 Migrating Campus Logos...');
  const campuses = await prisma.campus.findMany({
    where: { logoUrl: { startsWith: '/uploads/' } },
  });

  for (const campus of campuses) {
    console.log(`  Processing campus ${campus.id}: ${campus.logoUrl}`);
    const localPath = localPathFromUrl(campus.logoUrl);
    if (!localPath) continue;
    const url = await uploadFileToCloudinary(localPath, 'campuses');
    if (url) {
      await prisma.campus.update({
        where: { id: campus.id },
        data: { logoUrl: url },
      });
      console.log(`  ✓ Updated campus ${campus.id}`);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('☁️  Cloudinary Migration Script');
  console.log('========================================');
  console.log(`Upload base: ${UPLOAD_BASE}`);
  console.log(`Cloudinary configured: ${!!process.env.CLOUDINARY_CLOUD_NAME}`);

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ CLOUDINARY_CLOUD_NAME not set. Add Cloudinary credentials to .env');
    process.exit(1);
  }

  try {
    await migrateSettings();
    await migrateCategories();
    await migrateProducts();
    await migrateAds();
    await migrateUsers();
    await migrateCollections();
    await migrateCampuses();
    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
