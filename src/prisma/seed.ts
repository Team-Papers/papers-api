import { Role, UserStatus, AuthorStatus } from '../generated/prisma/enums';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

async function main() {
  console.error('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@2026', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@papers.app' },
    update: {},
    create: {
      email: 'admin@papers.app',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: "Paper's",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });
  console.error(`Admin created: ${admin.email}`);

  // Create test author
  const authorPassword = await bcrypt.hash('Author@2026', 12);
  const author = await prisma.user.upsert({
    where: { email: 'auteur@papers.app' },
    update: {},
    create: {
      email: 'auteur@papers.app',
      passwordHash: authorPassword,
      firstName: 'Jean',
      lastName: 'Auteur',
      role: Role.AUTHOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  await prisma.authorProfile.upsert({
    where: { userId: author.id },
    update: {},
    create: {
      userId: author.id,
      penName: 'Jean Auteur',
      bio: 'Auteur de test pour le développement',
      status: AuthorStatus.APPROVED,
    },
  });
  console.error(`Author created: ${author.email}`);

  // Create test reader
  const readerPassword = await bcrypt.hash('Reader@2026', 12);
  const reader = await prisma.user.upsert({
    where: { email: 'lecteur@papers.app' },
    update: {},
    create: {
      email: 'lecteur@papers.app',
      passwordHash: readerPassword,
      firstName: 'Marie',
      lastName: 'Lectrice',
      role: Role.READER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });
  console.error(`Reader created: ${reader.email}`);

  // Create categories
  const categories = [
    { name: 'Roman', slug: 'roman', icon: 'book', orderIndex: 1 },
    { name: 'Science-fiction', slug: 'science-fiction', icon: 'rocket', orderIndex: 2 },
    { name: 'Développement personnel', slug: 'developpement-personnel', icon: 'brain', orderIndex: 3 },
    { name: 'Business & Entrepreneuriat', slug: 'business-entrepreneuriat', icon: 'briefcase', orderIndex: 4 },
    { name: 'Technologie & Informatique', slug: 'technologie-informatique', icon: 'laptop', orderIndex: 5 },
    { name: 'Poésie', slug: 'poesie', icon: 'feather', orderIndex: 6 },
    { name: 'Biographie', slug: 'biographie', icon: 'user', orderIndex: 7 },
    { name: 'Histoire', slug: 'histoire', icon: 'clock', orderIndex: 8 },
    { name: 'Éducation', slug: 'education', icon: 'graduation-cap', orderIndex: 9 },
    { name: 'Santé & Bien-être', slug: 'sante-bien-etre', icon: 'heart', orderIndex: 10 },
    { name: 'Cuisine', slug: 'cuisine', icon: 'utensils', orderIndex: 11 },
    { name: 'Religion & Spiritualité', slug: 'religion-spiritualite', icon: 'star', orderIndex: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.error(`${categories.length} categories created`);

  // Create platform settings
  await prisma.setting.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: { rate: 30 } },
  });

  await prisma.setting.upsert({
    where: { key: 'withdrawal_threshold' },
    update: {},
    create: { key: 'withdrawal_threshold', value: { amount: 20000 } },
  });

  await prisma.setting.upsert({
    where: { key: 'max_file_size' },
    update: {},
    create: { key: 'max_file_size', value: { cover: 5242880, book: 104857600 } },
  });

  console.error('Platform settings created');
  console.error('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
