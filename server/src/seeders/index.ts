import { PrismaClient } from '@prisma/client';
import { seedUsers } from './userSeeder.js';
import { seedChats } from './chatSeeder.js';
import { seedMessages } from './messageSeeder.js';

const prisma = new PrismaClient();

export async function runAllSeeders() {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Step 1: Seed users
    console.log('📋 Step 1: Seeding users...');
    const users = await seedUsers();
    console.log('✅ User seeder done!\n');

    // Step 2: Seed chats
    console.log('📋 Step 2: Seeding chats...');
    const chats = await seedChats();
    console.log('✅ Chat seeder done!\n');

    // Step 3: Seed messages
    console.log('📋 Step 3: Seeding messages...');
    await seedMessages();
    console.log('✅ Message seeder done!\n');

    console.log('🎉 All seeders completed successfully!');
    console.log(`📊 Database now contains:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${chats?.length} chats`);
    console.log(`   - Multiple messages across all chats`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function clearAllData() {
  try {
    console.log('🧹 Starting database cleanup...');

    // Clear in reverse order (due to foreign key constraints)
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ All data cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Note: This file is designed to be imported and used by the main seeder index
// To run individually, use: npx tsx src/seeders/index.ts [command]

// Example usage:
// npx tsx src/seeders/index.ts seed    - Run all seeders
// npx tsx src/seeders/index.ts users   - Seed only users
// npx tsx src/seeders/index.ts chats   - Seed users and chats
// npx tsx src/seeders/index.ts messages - Seed only messages
// npx tsx src/seeders/index.ts clear   - Clear all data
