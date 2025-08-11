import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample chats data based on LeftSidebar chatData
const sampleChats = [
  {
    id: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    chatName: 'Personal Chat',
    isGroup: false,
    users: ['01e34912-a055-4452-b69a-21ce20d9f9d9', '02f45923-b166-5563-c70b-32df31ea0ea0'], // Emma & Sophia
    latestMessage: 'Hey! Are we still on for tonight? 😍, Let me know what time works for you!'
  },
  {
    id: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    chatName: 'Team Discussion',
    isGroup: true,
    users: ['01e34912-a055-4452-b69a-21ce20d9f9d9', '02f45923-b166-5563-c70b-32df31ea0ea0', '03g56934-c277-6674-d81c-43eg42fb1fb1'], // Emma, Sophia & James
    latestMessage: 'I just sent you the files. Check them out and tell me what you think.'
  },
  {
    id: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    chatName: 'Work Updates',
    isGroup: true,
    users: ['01e34912-a055-4452-b69a-21ce20d9f9d9', '03g56934-c277-6674-d81c-43eg42fb1fb1', '04h67945-d388-7785-e92d-54fh53gc2gc2'], // Emma, James & Ava
    latestMessage: 'Had such a great time today! 😍 Let\'s do it again soon!'
  },
  {
    id: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    chatName: 'Casual Talk',
    isGroup: false,
    users: ['02f45923-b166-5563-c70b-32df31ea0ea0', '04h67945-d388-7785-e92d-54fh53gc2gc2'], // Sophia & Ava
    latestMessage: 'The game last night was crazy! Did you see that final goal?'
  },
  {
    id: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    chatName: 'Tech Talk',
    isGroup: true,
    users: ['03g56934-c277-6674-d81c-43eg42fb1fb1', '04h67945-d388-7785-e92d-54fh53gc2gc2', '05i78956-e499-8896-f03e-65gi64hd3hd3'], // James, Ava & Olivia
    latestMessage: 'Morning! Don\'t forget our meeting. Let me know if you need anything then.'
  },
  {
    id: 'chat-06j89067-f510-9907-g14f-76hj75ie4ie4',
    chatName: 'Friends Chat',
    isGroup: false,
    users: ['05i78956-e499-8896-f03e-65gi64hd3hd3', '06j89067-f510-9907-g14f-76hj75ie4ie4'], // Olivia & Ethan
    latestMessage: 'Yo, are you free to catch up later? Got some news to share!'
  },
  {
    id: 'chat-07k90178-g621-0018-h25g-87ik86jf5jf5',
    chatName: 'Project Team',
    isGroup: true,
    users: ['06j89067-f510-9907-g14f-76hj75ie4ie4', '07k90178-g621-0018-h25g-87ik86jf5jf5', '08l01289-h732-1129-i36h-98jl97kg6kg6'], // Ethan, Daniel & Isabella
    latestMessage: 'Hey, I\'m running a little late. Should be there in 10 minutes!'
  },
  {
    id: 'chat-08l01289-h732-1129-i36h-98jl97kg6kg6',
    chatName: 'Coffee Club',
    isGroup: false,
    users: ['07k90178-g621-0018-h25g-87ik86jf5jf5', '08l01289-h732-1129-i36h-98jl97kg6kg6'], // Daniel & Isabella
    latestMessage: 'Did you try that new café yet? The pastries are amazing!'
  },
  {
    id: 'chat-09m12390-i843-2230-j47i-09km08lh7lh7',
    chatName: 'Weekend Plans',
    isGroup: false,
    users: ['08l01289-h732-1129-i36h-98jl97kg6kg6', '09m12390-i843-2230-j47i-09km08lh7lh7'], // Isabella & Liam
    latestMessage: 'Hey! Are we still on for tonight? 😍, Let me know what time works for you!'
  },
  {
    id: 'chat-0an23401-j954-3341-k58j-1aln19mi8mi8',
    chatName: 'Entertainment',
    isGroup: false,
    users: ['09m12390-i843-2230-j47i-09km08lh7lh7', '0an23401-j954-3341-k58j-1aln19mi8mi8'], // Liam & Mia
    latestMessage: 'Just finished watching that show! You were right, it\'s SO good!'
  }
];

export async function seedChats() {
  try {
    console.log('💬 Starting chat seeding...');

    // Check if chats already exist
    const existingChats = await prisma.chat.findMany();
    if (existingChats.length > 0) {
      console.log(`✅ Chats already exist (${existingChats.length} found). Skipping chat seeding.`);
      console.log('   Sample chats:', existingChats.slice(0, 3).map(c => `${c.chatName} (${c.isGroup ? 'Group' : 'Individual'})`));
      return existingChats;
    }

    // Get all users
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    console.log(`📱 Found ${users.length} users`);
    console.log('📝 Creating 10 chats (individual and group conversations)...');

    const createdChats = [];
    for (const chatData of sampleChats) {
      // Find users by their IDs
      const chatUsers = users.filter(user => chatData.users.includes(user.id));
      
      if (chatUsers.length === 0) {
        console.log(`⚠️ Skipping chat ${chatData.chatName} - no users found`);
        continue;
      }

      const chat = await prisma.chat.create({
        data: {
          id: chatData.id,
          chatName: chatData.chatName,
          isGroup: chatData.isGroup,
          users: {
            connect: chatUsers.map(user => ({ id: user.id }))
          },
          ...(chatData.isGroup && {
            groupAdmin: {
              connect: { id: chatUsers[0].id }
            }
          })
        },
        include: {
          users: true,
          groupAdmin: true
        }
      });
      
      createdChats.push(chat);
      console.log(`✅ Created chat: ${chat.chatName} (${chat.users.length} users)`);
    }

    console.log(`🎉 Chat seeding completed! Created ${createdChats.length} chats`);
    return createdChats;

  } catch (error) {
    console.error('❌ Error seeding chats:', error);
    throw error;
  }
}

export async function clearChats() {
  try {
    console.log('🧹 Clearing all chats...');
    
    // Delete all chats (this will also delete related messages due to foreign key constraints)
    const deletedChats = await prisma.chat.deleteMany();
    
    console.log(`✅ Deleted ${deletedChats.count} chats`);
    
  } catch (error) {
    console.error('❌ Error clearing chats:', error);
    throw error;
  }
}

// Run seeder if called directly
// Note: This file is designed to be imported and used by the main seeder index
// To run individually, use: npx tsx src/seeders/chatSeeder.ts
