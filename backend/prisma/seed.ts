import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KIMBWETA BITES database...\n');

  // ── Categories ──────────────────────────────────────────────────
  const catDefs = [
    { name: 'Snacks', sortOrder: 1 },
    { name: 'Drinks', sortOrder: 2 },
    { name: 'Meals',  sortOrder: 3 },
    { name: 'Sweets', sortOrder: 4 },
    { name: 'Stationery', sortOrder: 5 },
    { name: 'Toiletries', sortOrder: 6 },
    { name: 'Other', sortOrder: 99 },
  ];
  const categories: Record<string, any> = {};
  for (const c of catDefs) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: { sortOrder: c.sortOrder },
      create: { name: c.name, sortOrder: c.sortOrder },
    });
    categories[c.name] = cat;
  }
  console.log(`✅ ${catDefs.length} categories seeded`);

  // ── Campuses ────────────────────────────────────────────────────
  const campusDefs = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'University of Dar es Salaam', shortCode: 'UDSM', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.7735, lng: 39.2103 },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'University of Dodoma', shortCode: 'UDOM', city: 'Dodoma', region: 'DODOMA', lat: -6.1722, lng: 35.7395 },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'Sokoine University of Agriculture', shortCode: 'SUA', city: 'Morogoro', region: 'MOROGORO', lat: -6.8433, lng: 37.6413 },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Muhimbili University of Health and Allied Sciences', shortCode: 'MUHAS', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.8004, lng: 39.2137 },
    { id: 'c1000000-0000-0000-0000-000000000005', name: 'Ardhi University', shortCode: 'ARU', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.7625, lng: 39.2165 },
    { id: 'c1000000-0000-0000-0000-000000000006', name: 'Mbeya University of Science and Technology', shortCode: 'MUST', city: 'Mbeya', region: 'MBEYA', lat: -8.9094, lng: 33.4607 },
    { id: 'c1000000-0000-0000-0000-000000000007', name: 'Dar es Salaam Institute of Technology', shortCode: 'DIT', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.8162, lng: 39.2803 },
    { id: 'c1000000-0000-0000-0000-000000000008', name: 'Mbeya Technical College', shortCode: 'MTC', city: 'Mbeya', region: 'MBEYA', lat: -8.9240, lng: 33.4542 },
    { id: 'c1000000-0000-0000-0000-000000000009', name: 'Institute of Finance Management', shortCode: 'IFM', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.8119, lng: 39.2892 },
    { id: 'c1000000-0000-0000-0000-000000000010', name: 'College of Business Education', shortCode: 'CBE', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.8090, lng: 39.2720 },
    { id: 'c1000000-0000-0000-0000-000000000011', name: 'National Institute of Transport', shortCode: 'NIT', city: 'Dar es Salaam', region: 'DAR_ES_SALAAM', lat: -6.8055, lng: 39.2678 },
  ] as const;

  for (const c of campusDefs) {
    await prisma.campus.upsert({
      where: { id: c.id },
      update: { name: c.name, shortCode: c.shortCode },
      create: { id: c.id, name: c.name, shortCode: c.shortCode, city: c.city, region: c.region as any, latitude: c.lat, longitude: c.lng, isActive: true },
    });
  }
  console.log(`✅ ${campusDefs.length} campuses seeded`);

  // ── Super Admin (phone: 0757744555 / password: Lema16family) ────
  const superAdminPhone = '+255757744555';
  const superAdminPassword = 'Lema16family';
  const superAdminHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { phoneNumber: superAdminPhone },
    update: { passwordHash: superAdminHash, role: 'super_admin', status: 'active', phoneVerified: true },
    create: {
      name: 'Super Admin',
      phoneNumber: superAdminPhone,
      passwordHash: superAdminHash,
      role: 'super_admin',
      status: 'active',
      phoneVerified: true,
    },
  });
  console.log(`✅ Super Admin seeded: ${superAdminPhone} / ${superAdminPassword}`);

  // ── Campus Admin for UDSM (phone: 0712000001 / password: Lema16family) ──
  const adminPhone = '+255712000001';
  const adminHash = await bcrypt.hash('Lema16family', 12);

  const campusAdmin = await prisma.user.upsert({
    where: { phoneNumber: adminPhone },
    update: { passwordHash: adminHash, role: 'admin', status: 'active', phoneVerified: true },
    create: {
      name: 'UDSM Admin',
      phoneNumber: adminPhone,
      passwordHash: adminHash,
      role: 'admin',
      status: 'active',
      phoneVerified: true,
      campusId: 'c1000000-0000-0000-0000-000000000001',
    },
  });

  // Assign campus admin to UDSM
  await prisma.campusAdmin.upsert({
    where: { userId_campusId: { userId: campusAdmin.id, campusId: 'c1000000-0000-0000-0000-000000000001' } },
    update: { isActive: true, assignedBy: superAdmin.id },
    create: { userId: campusAdmin.id, campusId: 'c1000000-0000-0000-0000-000000000001', isActive: true, assignedBy: superAdmin.id },
  });
  console.log(`✅ Campus Admin (UDSM) seeded: ${adminPhone} / Lema16family`);

  // ── Sample Products for UDSM (APPROVED) ─────────────────────────
  const udsm = 'c1000000-0000-0000-0000-000000000001';
  const productDefs = [
    { name: 'Chips Mbuzi', description: 'Crispy, perfectly seasoned chips made fresh daily.', price: 2500, catName: 'Snacks', qty: 50 },
    { name: 'Juice Ya Embe', description: 'Fresh mango juice blended from local mangoes.', price: 1500, catName: 'Drinks', qty: 30 },
    { name: 'Pilau na Nyama', description: 'Slow-cooked fragrant rice with premium beef.', price: 5000, catName: 'Meals', qty: 20 },
    { name: 'Mandazi (4 pcs)', description: 'Soft fluffy Tanzanian doughnuts.', price: 1000, catName: 'Sweets', qty: 40 },
    { name: 'Chapati + Beans', description: 'Layered chapati with hearty bean stew.', price: 2000, catName: 'Meals', qty: 25 },
    { name: 'Soda Baridi', description: 'Chilled soda in various flavors.', price: 800, catName: 'Drinks', qty: 60 },
    { name: 'Samosa x3', description: 'Golden crispy samosas with minced meat.', price: 1200, catName: 'Snacks', qty: 35 },
    { name: 'Chai ya Maziwa', description: 'Rich milk tea with cinnamon and cardamom.', price: 700, catName: 'Drinks', qty: 45 },
  ];

  let productCount = 0;
  for (const p of productDefs) {
    const cat = categories[p.catName] || categories['Other'];
    const product = await prisma.product.upsert({
      where: { id: `prod000${productCount + 1}-0000-0000-0000-000000000001` },
      update: {},
      create: {
        id: `prod000${productCount + 1}-0000-0000-0000-000000000001`,
        name: p.name,
        description: p.description,
        price: p.price,
        campusId: udsm,
        categoryId: cat.id,
        createdBy: campusAdmin.id,
        status: 'APPROVED',
        isAvailable: true,
        approvedBy: superAdmin.id,
        approvedAt: new Date(),
      },
    });
    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, quantity: p.qty, lowStockThreshold: 5 },
    });
    productCount++;
  }
  console.log(`✅ ${productCount} products seeded for UDSM (APPROVED)`);

  // ── Payment Details ──────────────────────────────────────────────
  await prisma.paymentDetail.upsert({
    where: { id: 'pay00001-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'pay00001-0000-0000-0000-000000000001',
      campusId: udsm,
      provider: 'MPESA',
      phoneNumber: '+255757744555',
      accountName: 'KIMBWETA BITES UDSM',
      instructions: 'Send payment to M-Pesa, then confirm your order number',
      isActive: true,
    },
  });
  console.log('✅ Payment details seeded');

  // ── Social Links ─────────────────────────────────────────────────
  const socialLinks = [
    { platform: 'whatsapp', url: 'https://wa.me/255757744555' },
    { platform: 'instagram', url: 'https://instagram.com/kimbwetabites' },
    { platform: 'facebook', url: 'https://facebook.com/kimbwetabites' },
    { platform: 'tiktok', url: 'https://tiktok.com/@kimbwetabites' },
  ];
  for (const s of socialLinks) {
    await prisma.socialLink.upsert({
      where: { platform: s.platform as any },
      update: { url: s.url },
      create: { platform: s.platform as any, url: s.url, isActive: true },
    });
  }
  console.log('✅ Social links seeded');

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────');
  console.log('Super Admin:  0757744555 / Lema16family');
  console.log('Campus Admin: 0712000001 / Lema16family');
  console.log('─────────────────────────────');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
