import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample messages data with proper chat IDs and sender IDs based on Chat component
interface MessageData {
  content: string;
  type: 'timestamp' | 'incoming' | 'outgoing' | 'file';
  chatId: string;
  senderId: string;
  createdAt: Date;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  imagesJson?: string;
}

const sampleMessages: MessageData[] = [
  // Chat 1: Personal Chat (Emma & Sophia)
  {
    content: '10:20 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    content: 'Wow, 😍\nWhere are you?',
    type: 'incoming',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.8), // 1.8 hours ago
  },
  {
    content: '10:22 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.6), // 1.6 hours ago
  },
  {
    content: 'Jojo',
    type: 'incoming',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
  },
  {
    content: '10:23 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.4), // 1.4 hours ago
  },
  {
    content: 'Thanks! I\'m at Bali, the weather is perfect! Wish you were here!',
    type: 'incoming',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.3), // 1.3 hours ago
    imagesJson: JSON.stringify([
      'https://storage.googleapis.com/a1aa/image/07119019-82b3-4daf-bcf4-ecd929047c92.jpg',
      'https://storage.googleapis.com/a1aa/image/4d2a9784-f1ac-45cc-d5fa-50c2e056be6d.jpg',
      'https://storage.googleapis.com/a1aa/image/3ed07014-a0d3-4abd-5406-0ccad49ce690.jpg'
    ])
  },
  {
    content: '10:25 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.2), // 1.2 hours ago
  },
  {
    content: 'Wow, these look amazing! 😍\nWhere are you?',
    type: 'outgoing',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.1), // 1.1 hours ago
  },
  {
    content: '10:24 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
  },
  {
    content: 'That sounds incredible! Enjoy your trip, and send more pics! 📸',
    type: 'outgoing',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0.9), // 0.9 hours ago
  },
  {
    content: '10:25 PM',
    type: 'timestamp',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0.8), // 0.8 hours ago
  },
  {
    content: 'video.mp4',
    type: 'file',
    chatId: 'chat-01e34912-a055-4452-b69a-21ce20d9f9d9',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0.7), // 0.7 hours ago
    fileName: 'video.mp4',
    fileSize: '2mb',
    fileType: 'Document File'
  },

  // Chat 2: Team Discussion (Emma, Sophia & James)
  {
    content: 'Good morning everyone! ☀️',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    content: 'Morning! How\'s everyone\'s day going?',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
  },
  {
    content: 'Pretty good! Working on some new features for our app',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    content: 'That sounds exciting! What kind of features?',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
  },
  {
    content: 'Voice messages, file sharing, and real-time notifications!',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
  },
  {
    content: 'Wow! That\'s going to be awesome! Can\'t wait to test it out',
    type: 'incoming',
    chatId: 'chat-02f45923-b166-5563-c70b-32df31ea0ea0',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 45), // 45 minutes ago
  },

  // Chat 3: Work Updates (Emma, James & Ava)
  {
    content: 'Hi team! Quick update on the project timeline',
    type: 'incoming',
    chatId: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    content: 'We\'re ahead of schedule on the backend development',
    type: 'incoming',
    chatId: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
  },
  {
    content: 'Great news! The frontend team is also making good progress',
    type: 'incoming',
    chatId: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    senderId: '04h67945-d388-7785-e92d-54fh53gc2gc2', // Ava
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    content: 'Perfect! We should be ready for testing by next week',
    type: 'incoming',
    chatId: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    senderId: '01e34912-a055-4452-b69a-21ce20d9f9d9', // Emma
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
  },
  {
    content: 'Excellent! I\'ll prepare the test cases and documentation',
    type: 'incoming',
    chatId: 'chat-03g56934-c277-6674-d81c-43eg42fb1fb1',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },

  // Chat 4: Casual Talk (Sophia & Ava)
  {
    content: 'Hey! Did you see the new movie that came out?',
    type: 'incoming',
    chatId: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    content: 'Yes! I watched it last night. It was really good!',
    type: 'incoming',
    chatId: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    senderId: '04h67945-d388-7785-e92d-54fh53gc2gc2', // Ava
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5), // 4.5 hours ago
  },
  {
    content: 'I\'m planning to watch it this weekend. No spoilers please! 😄',
    type: 'incoming',
    chatId: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    content: 'Haha, no worries! You\'ll love it though',
    type: 'incoming',
    chatId: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    senderId: '04h67945-d388-7785-e92d-54fh53gc2gc2', // Ava
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
  },
  {
    content: 'Can\'t wait! Thanks for the recommendation',
    type: 'incoming',
    chatId: 'chat-04h67945-d388-7785-e92d-54fh53gc2gc2',
    senderId: '02f45923-b166-5563-c70b-32df31ea0ea0', // Sophia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },

  // Chat 5: Tech Talk (James, Ava & Olivia)
  {
    content: 'Has anyone tried the new React 18 features?',
    type: 'incoming',
    chatId: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    content: 'Yes! The concurrent features are really promising',
    type: 'incoming',
    chatId: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    senderId: '04h67945-d388-7785-e92d-54fh53gc2gc2', // Ava
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5.5), // 5.5 hours ago
  },
  {
    content: 'I\'m still on React 17. Should I upgrade?',
    type: 'incoming',
    chatId: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    senderId: '05i78956-e499-8896-f03e-65gi64hd3hd3', // Olivia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    content: 'Definitely! The performance improvements are worth it',
    type: 'incoming',
    chatId: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    senderId: '03g56934-c277-6674-d81c-43eg42fb1fb1', // James
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5), // 4.5 hours ago
  },
  {
    content: 'Thanks for the advice! I\'ll start the migration this weekend',
    type: 'incoming',
    chatId: 'chat-05i78956-e499-8896-f03e-65gi64hd3hd3',
    senderId: '05i78956-e499-8896-f03e-65gi64hd3hd3', // Olivia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
];

export async function seedMessages() {
  try {
    console.log('🌱 Starting message seeding...');

    // Get existing chats and users
    const chats = await prisma.chat.findMany({
      include: {
        users: true
      }
    });

    const users = await prisma.user.findMany();

    if (chats.length === 0) {
      console.log('❌ No chats found. Please seed chats first.');
      return;
    }

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    console.log(`📱 Found ${chats.length} chats and ${users.length} users`);

    // Check if messages already exist
    const existingMessages = await prisma.message.count();
    if (existingMessages > 0) {
      console.log(`✅ Messages already exist (${existingMessages} found). Skipping message seeding.`);
      console.log('   Sample message types:', await getSampleMessageTypes());
      return;
    }

    console.log('📝 Creating realistic messages with proper types (timestamp, incoming, outgoing, file)...');

    // Create messages for each chat
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      const chatUsers = chat.users;
      
      if (chatUsers.length === 0) continue;

      console.log(`💬 Seeding messages for chat: ${chat.chatName || `Chat ${i + 1}`}`);

      // Get messages for this chat
      const chatMessages = sampleMessages.filter(msg => msg.chatId === chat.id);
      
      if (chatMessages.length === 0) {
        console.log(`⚠️ No messages found for chat ${chat.id}`);
        continue;
      }

      console.log(`📝 Creating ${chatMessages.length} messages for this chat...`);

      for (const messageData of chatMessages) {
        // Find the sender user
        const sender = users.find(user => user.id === messageData.senderId);
        if (!sender) {
          console.log(`⚠️ Skipping message - sender not found: ${messageData.senderId}`);
          continue;
        }

        // Create the message
        const message = await prisma.message.create({
          data: {
            content: messageData.content,
            type: messageData.type.toUpperCase() as any, // Convert to uppercase for database
            sender: {
              connect: { id: sender.id }
            },
            chat: {
              connect: { id: chat.id }
            },
            createdAt: messageData.createdAt,
            fileName: messageData.fileName,
            fileSize: messageData.fileSize,
            fileType: messageData.fileType,
            imagesJson: messageData.imagesJson
          }
        });

        console.log(`✅ Created message: ${message.content.substring(0, 30)}...`);
      }

      // Update chat's latest message
      const lastMessage = await prisma.message.findFirst({
        where: { chatId: chat.id },
        orderBy: { createdAt: 'desc' }
      });

      if (lastMessage) {
        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            latestMessage: {
              connect: { id: lastMessage.id }
            }
          }
        });
      }
    }

    console.log('🎉 Message seeding completed successfully!');
    console.log(`📊 Created messages across ${chats.length} chats`);

  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    throw error;
  }
}

// Helper function to get sample message types
async function getSampleMessageTypes() {
  try {
    const messages = await prisma.message.findMany({
      select: { type: true },
      take: 5
    });
    return [...new Set(messages.map(m => m.type.toLowerCase()))]; // Convert to lowercase for display
  } catch (error) {
    return ['unknown'];
  }
}

export async function clearMessages() {
  try {
    console.log('🧹 Clearing all messages...');
    
    // Delete all messages (this will also delete related reactions)
    const deletedMessages = await prisma.message.deleteMany();
    
    console.log(`✅ Deleted ${deletedMessages.count} messages`);
    
    // Reset chat latest messages
    await prisma.chat.updateMany({
      data: {
        latestMessageId: null
      }
    });
    
    console.log('✅ Reset chat latest messages');
    
  } catch (error) {
    console.error('❌ Error clearing messages:', error);
    throw error;
  }
}

// Run seeder if called directly
// Note: This file is designed to be imported and used by the main seeder index
// To run individually, use: npx tsx src/seeders/messageSeeder.ts
