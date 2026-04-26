# ChatApp — Real-time Messaging with MERN Stack

A full-stack real-time chat application supporting direct messages and group channels, built with the MERN stack and Socket.IO.

## Features

- **Real-time messaging** — instant delivery of text and file messages via WebSockets (Socket.IO)
- **Direct messages** — one-on-one private conversations with contact search
- **Group channels** — create named channels with multiple members; admin controls who can participate
- **File sharing** — upload and share images and documents; files are stored on Cloudinary
- **Emoji picker** — built-in emoji panel for text messages
- **User authentication** — signup/login with JWT stored in HttpOnly cookies; protected REST and Socket routes
- **Profile management** — set avatar (uploaded to Cloudinary), display name, and personalized color
- **Sorted contact list** — conversations ordered by most recent message, updated in real time

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7 |
| UI | Tailwind CSS v4, Radix UI, Lucide, shadcn/ui |
| State | Zustand |
| Real-time | Socket.IO client |
| HTTP | Axios |
| Backend | Node.js, Express v5 |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO server |
| Auth | JWT, bcrypt |
| File storage | Cloudinary, Multer |
| Dev tooling | Nodemon, Concurrently, ESLint |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier is enough)

### Installation

```bash
git clone https://github.com/xuandu303/chat-app-mern.git
cd chat-app-mern
npm install          # installs concurrently at the root
npm install --prefix server
npm install --prefix client
```

### Environment variables

**server/.env**
```env
PORT=3001
DATABASE_URL=mongodb://localhost:27017/chat-app
JWT_KEY=your_jwt_secret
ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env**
```env
VITE_SERVER_URL=http://localhost:3001
```

### Run in development

```bash
npm run dev
```

This starts both the Express server (port 3001) and the Vite dev server (port 5173) concurrently.

## Project Structure

```
chat-app-mern/
├── server/
│   ├── controllers/        # authCtrl, messageCtrl, channelCtrl, contactCtrl
│   ├── middlewares/        # JWT verification for REST and Socket.IO
│   ├── models/             # User, Message, Channel (Mongoose schemas)
│   ├── routes/             # authRoutes, messagesRoutes, channelsRoutes, contactsRoutes
│   ├── utils/              # Cloudinary config, Multer storage setup
│   ├── socket.js           # Socket.IO setup, DM and channel message handlers
│   └── index.js            # Express app entry point
└── client/
    ├── src/
    │   ├── components/     # Shared UI (shadcn/ui components, contact list)
    │   ├── context/        # SocketContext — manages socket lifecycle
    │   ├── pages/
    │   │   ├── auth/       # Login and signup tabs
    │   │   ├── chat/       # Main chat layout (contacts panel, chat window)
    │   │   └── profile/    # Profile setup and avatar upload
    │   ├── store/          # Zustand store (auth slice, chat slice)
    │   └── utils/          # API route constants
    └── vite.config.js
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` (root) | Start server + client concurrently |
| `npm run dev --prefix server` | Start Express server only |
| `npm run dev --prefix client` | Start Vite dev server only |
| `npm run build --prefix client` | Build client for production |

## Real-time Communication

The server keeps an in-memory `Map<userId, socketId>` to track online users. When a message is sent, the server saves it to MongoDB, then looks up the recipient's socket ID from the map and emits directly to that socket. For DMs, the event is emitted to both sender and recipient so both UIs update through the same code path. For channels, the server loops over all members and emits to each one individually.

Authentication works via a custom `io.use()` middleware that manually parses the JWT from the socket handshake `cookie` header — Socket.IO connections don't go through Express middleware, so this had to be handled separately.

On the client, the socket is initialized inside a `SocketProvider` context and torn down on logout to avoid memory leaks.

## What I Learned

- **What real-time actually means** — HTTP is request/response and cannot push data to the client; WebSockets keep a persistent connection open so the server can emit events at any time
- **Socket.IO basics** — setting up a server, connecting from the client, emitting and listening to named events, handling disconnects
- **Targeting a specific user** — sockets are anonymous by default; mapping each `userId` to its `socketId` on the server is required to deliver messages to the right person
- **Socket auth is separate from HTTP auth** — Socket.IO handshakes bypass Express middleware, so the JWT must be verified manually from the raw cookie header
- **Stale closures in React** — event handlers registered once on mount don't see updated state; `useAppStore.getState()` was the fix
- **MongoDB aggregation** — a `$lookup` + `$sort` pipeline sorts channels by last message time without loading all messages into memory
