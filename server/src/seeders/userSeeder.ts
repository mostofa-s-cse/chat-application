import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample users data based on LeftSidebar chatData with UUIDs
const sampleUsers = [
  {
    id: '01e34912-a055-4452-b69a-21ce20d9f9d9',
    firstName: 'Emma',
    lastName: 'Carter',
    email: 'emma.carter@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/81be462c-bb01-439f-abf9-79fa0c1b1f56.jpg',
    bio: 'Hey! Are we still on for tonight? 😍',
    isOnline: false
  },
  {
    id: '02f45923-b166-5563-c70b-32df31ea0ea0',
    firstName: 'Sophia',
    lastName: 'Rivera',
    email: 'sophia.rivera@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/030ff9d7-440d-4505-1c02-746ca8c66c53.jpg',
    bio: 'I just sent you the files. Check them out and tell me what you think.',
    isOnline: true
  },
  {
    id: '03g56934-c277-6674-d81c-43eg42fb1fb1',
    firstName: 'James',
    lastName: 'Mitchell',
    email: 'james.mitchell@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/46d60eb8-029e-4a16-b49e-a53a210ba0bc.jpg',
    bio: 'Had such a great time today! 😍 Let\'s do it again soon!',
    isOnline: false
  },
  {
    id: '04h67945-d388-7785-e92d-54fh53gc2gc2',
    firstName: 'Ava',
    lastName: 'Martinez',
    email: 'ava.martinez@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/6befe650-e504-4065-dcdf-a1dc9a5bb15a.jpg',
    bio: 'The game last night was crazy! Did you see that final goal?',
    isOnline: false
  },
  {
    id: '05i78956-e499-8896-f03e-65gi64hd3hd3',
    firstName: 'Olivia',
    lastName: 'Nguyen',
    email: 'olivia.nguyen@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg',
    bio: 'Morning! Don\'t forget our meeting. Let me know if you need anything then.',
    isOnline: true
  },
  {
    id: '06j89067-f510-9907-g14f-76hj75ie4ie4',
    firstName: 'Ethan',
    lastName: 'Walker',
    email: 'ethan.walker@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/42c1205c-6222-445c-10eb-71b0ac202095.jpg',
    bio: 'Yo, are you free to catch up later? Got some news to share!',
    isOnline: false
  },
  {
    id: '07k90178-g621-0018-h25g-87ik86jf5jf5',
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.kim@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/e88c0748-9f29-4848-e60b-ac9fa48100a6.jpg',
    bio: 'Hey, I\'m running a little late. Should be there in 10 minutes!',
    isOnline: true
  },
  {
    id: '08l01289-h732-1129-i36h-98jl97kg6kg6',
    firstName: 'Isabella',
    lastName: 'Flores',
    email: 'isabella.flores@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/3fd278a2-7f6-465d-76b6-b4a50d5944f1.jpg',
    bio: 'Did you try that new café yet? The pastries are amazing!',
    isOnline: true
  },
  {
    id: '09m12390-i843-2230-j47i-09km08lh7lh7',
    firstName: 'Liam',
    lastName: 'Thompson',
    email: 'liam.thompson@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/490ab86f-1df4-4aba-39a9-1c9a0ca4fa55.jpg',
    bio: 'Hey! Are we still on for tonight? 😍, Let me know what time works for you!',
    isOnline: false
  },
  {
    id: '0an23401-j954-3341-k58j-1aln19mi8mi8',
    firstName: 'Mia',
    lastName: 'Johnson',
    email: 'mia.johnson@example.com',
    password: 'password123', // Plain text password, will be hashed during seeding
    profilePic: 'https://storage.googleapis.com/a1aa/image/062854ce-c585-493c-3125-86a227c8655d.jpg',
    bio: 'Just finished watching that show! You were right, it\'s SO good!',
    isOnline: true
  }
];

export async function seedUsers() {
  try {
    console.log('👥 Starting user seeding...');

    // Check if users already exist
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log(`✅ Users already exist (${existingUsers.length} found). Skipping user seeding.`);
      console.log('   Sample users:', existingUsers.slice(0, 3).map(u => `${u.firstName} ${u.lastName}`));
      return existingUsers;
    }

    console.log('📝 Creating 10 users with UUIDs and hashed passwords...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      // Hash the password for security
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          profilePic: userData.profilePic,
          bio: userData.bio,
          isOnline: userData.isOnline
        }
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log(`🎉 User seeding completed! Created ${createdUsers.length} users`);
    console.log(`🔑 Default password for all users: password123`);
    
    return createdUsers;

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

export async function clearUsers() {
  try {
    console.log('🧹 Clearing all users...');
    
    // Delete all users (this will also delete related chats and messages due to foreign key constraints)
    const deletedUsers = await prisma.user.deleteMany();
    
    console.log(`✅ Deleted ${deletedUsers.count} users`);
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user;
  } catch (error) {
    console.error('❌ Error finding user:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePic: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      }
    });
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
}

// Run seeder if called directly
// Note: This file is designed to be imported and used by the main seeder index
// To run individually, use: npx tsx src/seeders/userSeeder.ts
