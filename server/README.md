# Chat Application Backend

This is the backend server for the chat application, built with Node.js, Express, TypeScript, and Prisma.

## Features

- User authentication and authorization
- Real-time messaging
- Group chat functionality
- Audio and video calls
- Online/offline status
- Message history
- File sharing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chat?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client
CLIENT_URL=http://localhost:3000
```

3. Set up the database:
```bash
# Create the database
createdb chat

# Run migrations
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Messages
- `GET /api/messages/:userId` - Get messages between two users
- `POST /api/messages/:userId` - Send message to user
- `DELETE /api/messages/:messageId` - Delete message

### Groups
- `GET /api/groups` - Get all groups for current user
- `POST /api/groups` - Create new group
- `GET /api/groups/:groupId` - Get group by ID
- `PATCH /api/groups/:groupId` - Update group
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:userId` - Remove member from group
- `DELETE /api/groups/:groupId/members` - Leave group

### Group Messages
- `GET /api/group-messages/:groupId` - Get group messages
- `POST /api/group-messages/:groupId` - Send group message
- `DELETE /api/group-messages/:messageId` - Delete group message

## WebSocket Events

### Client to Server
- `privateMessage` - Send private message
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `setOnline` - Set user status to online
- `setOffline` - Set user status to offline

### Server to Client
- `newMessage` - New message received
- `messageSent` - Message sent confirmation
- `messageDeleted` - Message deleted notification
- `userTyping` - User is typing notification
- `userStoppedTyping` - User stopped typing notification
- `userStatusChanged` - User status changed notification
- `newGroupMessage` - New group message received
- `groupMessageDeleted` - Group message deleted notification

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio to view/edit data
- `npx prisma generate` - Generate Prisma Client

## License

MIT 