-- ============================================================
-- KIMBWETA BITES — Seed Data
-- Super Admin: 0757744555 / Lema16family
-- Campus Admin (UDSM): 0712000001 / Lema16family
-- ============================================================

-- Campuses
INSERT INTO campuses (id, name, short_code, city, region, latitude, longitude, max_products, max_riders, is_active, created_at, updated_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001','University of Dar es Salaam','UDSM','Dar es Salaam','DAR_ES_SALAAM',-6.7735,39.2103,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000002','University of Dodoma','UDOM','Dodoma','DODOMA',-6.1722,35.7395,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000003','Sokoine University of Agriculture','SUA','Morogoro','MOROGORO',-6.8433,37.6413,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000004','Muhimbili University of Health and Allied Sciences','MUHAS','Dar es Salaam','DAR_ES_SALAAM',-6.8004,39.2137,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000005','Ardhi University','ARU','Dar es Salaam','DAR_ES_SALAAM',-6.7625,39.2165,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000006','Mbeya University of Science and Technology','MUST','Mbeya','MBEYA',-8.9094,33.4607,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000007','Dar es Salaam Institute of Technology','DIT','Dar es Salaam','DAR_ES_SALAAM',-6.8162,39.2803,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000008','Mbeya Technical College','MTC','Mbeya','MBEYA',-8.9240,33.4542,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000009','Institute of Finance Management','IFM','Dar es Salaam','DAR_ES_SALAAM',-6.8119,39.2892,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000010','College of Business Education','CBE','Dar es Salaam','DAR_ES_SALAAM',-6.8090,39.2720,50,20,true,NOW(),NOW()),
  ('c1000000-0000-0000-0000-000000000011','National Institute of Transport','NIT','Dar es Salaam','DAR_ES_SALAAM',-6.8055,39.2678,50,20,true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),'Snacks',1,true,NOW(),NOW()),
  (gen_random_uuid(),'Drinks',2,true,NOW(),NOW()),
  (gen_random_uuid(),'Meals',3,true,NOW(),NOW()),
  (gen_random_uuid(),'Sweets',4,true,NOW(),NOW()),
  (gen_random_uuid(),'Stationery',5,true,NOW(),NOW()),
  (gen_random_uuid(),'Toiletries',6,true,NOW(),NOW()),
  (gen_random_uuid(),'Other',99,true,NOW(),NOW())
ON CONFLICT (name) DO NOTHING;

-- Super Admin (password: Lema16family — bcrypt hash below)
-- Hash generated with: bcrypt.hash('Lema16family', 12)
INSERT INTO users (id, name, phone_number, password_hash, role, status, phone_verified, created_at, updated_at)
VALUES (
  'sa000000-0000-0000-0000-000000000001',
  'Super Admin',
  '+255757744555',
  '$2a$12$92e7Lc6M4BCIO0lvP6n15.b71TW/bOts1q0.T5pE2jNxfDCE4iEW.',
  'super_admin','active',true,NOW(),NOW()
) ON CONFLICT (phone_number) DO UPDATE SET
  password_hash = '$2a$12$92e7Lc6M4BCIO0lvP6n15.b71TW/bOts1q0.T5pE2jNxfDCE4iEW.',
  role = 'super_admin', status = 'active', phone_verified = true;

-- Campus Admin UDSM (password: Lema16family)
INSERT INTO users (id, name, phone_number, password_hash, role, status, phone_verified, campus_id, created_at, updated_at)
VALUES (
  'ca000000-0000-0000-0000-000000000001',
  'UDSM Admin',
  '+255712000001',
  '$2a$12$92e7Lc6M4BCIO0lvP6n15.b71TW/bOts1q0.T5pE2jNxfDCE4iEW.',
  'admin','active',true,'c1000000-0000-0000-0000-000000000001',NOW(),NOW()
) ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO campus_admins (user_id, campus_id, is_active, assigned_by, created_at, updated_at)
VALUES (
  'ca000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  true,
  'sa000000-0000-0000-0000-000000000001',
  NOW(),NOW()
) ON CONFLICT (user_id, campus_id) DO NOTHING;
