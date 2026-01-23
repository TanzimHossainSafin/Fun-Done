# Udyomix 🎓

A comprehensive student productivity and study management platform powered by AI. Udyomix helps students organize their studies, find study partners, track habits, manage schedules, prepare for interviews, and maintain a healthy work-life balance.

## ✨ Features

### 🎯 Study Management
- **AI-Powered Study Matching**: Find compatible study partners using AI analysis
- **Study Groups**: Create and join study groups with real-time chat
- **Study Sessions**: Track and manage your study sessions
- **Study Profile**: Create a detailed profile with subjects, goals, and learning style

### 🤖 AI-Powered Tools
- **AI Moderator Chat**: Get study guidance from an AI assistant in your study groups
- **Study Session Agenda Generator**: Generate structured study plans based on topics and duration
- **Schedule Analyzer**: Get AI insights about your schedule productivity and balance
- **Habit Suggestions**: Receive personalized habit recommendations based on your tracking data

### 📅 Schedule & Productivity
- **Smart Timetable**: Manage your schedule with color-coded events
- **Habit Tracker**: Track daily and weekly habits with visual progress indicators
- **Productivity Reports**: Analyze your productivity patterns and get recommendations
- **Pomodoro Timer**: Built-in timer for focused study sessions

### 💼 Career & Interview
- **Mock Interviews**: Practice interviews with AI-powered questions and feedback
- **Career Analyzer**: Get insights about your career path and opportunities
- **Skill Assessment**: Evaluate your skills and identify areas for improvement

### 🎉 Refreshment
- **Fun Joke Contests**: Participate in joke contests and vote on submissions
- **Community Engagement**: Connect with other students through fun activities

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **Chart.js** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Cloudinary** for image uploads

### AI Integration
- **Google Gemini AI** (gemini-2.5-flash) for:
  - Study partner matching
  - Chat moderation
  - Schedule analysis
  - Habit suggestions
  - Interview questions
  - Career analysis

### Development Tools
- **Turbo** for monorepo management
- **ESLint** for code quality
- **TypeScript** for type checking

## 📁 Project Structure

```
Udyomix/
├── apps/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── features/  # Feature-based modules
│   │   │   │   ├── auth/      # Authentication
│   │   │   │   ├── study/     # Study features
│   │   │   │   ├── schedule/  # Timetable & habits
│   │   │   │   ├── interview/ # Mock interviews
│   │   │   │   ├── career/    # Career analysis
│   │   │   │   └── dashboard/ # Dashboard pages
│   │   │   ├── components/    # Shared components
│   │   │   ├── context/       # React contexts
│   │   │   └── services/      # API services
│   │   └── package.json
│   │
│   └── backend/           # Node.js backend API
│       ├── src/
│       │   ├── controller/    # Request handlers
│       │   ├── models/        # MongoDB models
│       │   ├── router/        # API routes
│       │   ├── services/      # Business logic & AI
│       │   ├── middleware/    # Auth middleware
│       │   └── utils/         # Utilities
│       └── package.json
│
├── package.json          # Root package.json (workspaces)
├── turbo.json           # Turbo configuration
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v10.8.2 or higher)
- **MongoDB** (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Fun Done"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in `apps/backend/`:
   ```env
   PORT=3000
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   This will start both frontend and backend using Turbo.

   Or start them separately:
   
   **Backend:**
   ```bash
   cd apps/backend
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd apps/frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📚 API Endpoints

### Authentication
- `POST /app/v1/users/register` - Register a new user
- `POST /app/v1/users/login` - Login user
- `POST /app/v1/users/logout` - Logout user

### Study Features
- `GET /app/v1/study/match/:userId` - Get AI-powered study matches
- `POST /app/v1/study/groups` - Create a study group
- `GET /app/v1/study/groups` - Get user's study groups
- `POST /app/v1/study/groups/:groupId/ai-chat` - Chat with AI moderator
- `POST /app/v1/study/ai/generate-agenda` - Generate study agenda
- `POST /app/v1/study/schedule` - Create schedule event
- `POST /app/v1/study/schedule/analyze` - Analyze schedule with AI
- `POST /app/v1/study/schedule/habits` - Get AI habit suggestions

### Career & Interview
- `POST /app/v1/career/analyze` - Analyze career path
- `POST /app/v1/interview/start` - Start mock interview
- `GET /app/v1/interview/history` - Get interview history

### Fun Features
- `GET /app/v1/funs` - Get all jokes
- `POST /app/v1/funs` - Submit a joke
- `POST /app/v1/funs/:id/vote` - Vote on a joke

## 🎨 Key Features in Detail

### AI-Powered Study Matching
The platform uses Google Gemini AI to analyze study profiles and find compatible study partners. Each match includes:
- Compatibility score
- AI-generated recommendation
- Study tips for effective collaboration
- Suggested topics to study together

### Smart Schedule Management
- Add events with types (class, study, exam, assignment, break, personal)
- Color-coded visualization
- AI analysis provides:
  - Productivity score (0-100)
  - Balance analysis
  - Actionable recommendations
  - Burnout warnings

### Habit Tracking
- Track daily and weekly habits
- Visual progress bars
- AI-powered suggestions based on:
  - Current habit performance
  - Study goals alignment
  - Productivity patterns

### Real-time Features
- Socket.IO integration for:
  - Group chat
  - Live notifications
  - Real-time updates

## 🔒 Authentication

The application uses JWT-based authentication with HTTP-only cookies for security. Protected routes require valid authentication tokens.

## 📝 Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## 🌐 Environment Variables

### Backend Required Variables
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent features
- MongoDB Atlas for database hosting
- Cloudinary for image management
- All the open-source libraries that made this project possible

---

**Built with ❤️ for students, by students**
