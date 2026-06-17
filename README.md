# AI Interview Prep Tool

A full-stack AI-powered mock interview application that generates tailored technical interview questions and provides real-time feedback on your answers using AI.

## What it does

1. **Sign up / Log in** — Create an account to track your interview history
2. **Configure your interview** — Choose your target role, experience level, and optionally paste a job description
3. **Answer AI-generated questions** — The app generates 5 interview questions tailored to your profile
4. **Get instant AI feedback** — Each answer is evaluated with a score (1-10), strengths, areas for improvement, and ideal answer hints
5. **Review your results** — See your overall score and a detailed breakdown of all questions and feedback
6. **Track your progress** — View history of all past interview sessions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose ODM) |
| **AI** | Groq API (LLaMA 3.3 70B) |
| **Auth** | JWT + bcrypt |

## Project Structure

```
InterviewPrep/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Spinner
│   │   ├── context/        # AuthContext (JWT state)
│   │   ├── pages/          # Login, Register, Setup, Interview, Results, History
│   │   ├── utils/          # API fetch wrapper
│   │   └── App.jsx         # Router + protected routes
│   └── vite.config.js      # Proxy /api → localhost:5000
│
├── server/                 # Express backend
│   ├── middleware/          # JWT auth middleware
│   ├── models/             # User, Session (Mongoose)
│   ├── routes/             # /auth, /interview
│   ├── services/           # groqService.js (AI integration)
│   └── index.js            # Server entry point
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key ([console.groq.com/keys](https://console.groq.com/keys))

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd InterviewPrep
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your actual values:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-prep
JWT_SECRET=any_random_secret_string_here
```

Start the server:

```bash
node index.js
# 🚀 Server running on http://localhost:5000
# ✅ MongoDB connected
```

### 3. Set up the client

```bash
cd client
npm install
npm run dev
# ➜ Local: http://localhost:5173/
```

### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) and create an account to get started.

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Sign in, get JWT |
| POST | `/api/interview/start` | Yes | Generate 5 questions |
| POST | `/api/interview/answer` | Yes | Submit answer, get AI evaluation |
| POST | `/api/interview/complete` | Yes | Finish session, calculate score |
| GET | `/api/interview/sessions` | Yes | List all past sessions |
| GET | `/api/interview/session/:id` | Yes | Get full session details |
| GET | `/health` | No | Server health check |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for LLaMA 3.3 | `gsk_abc123...` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs | `my-super-secret-key` |

## License

MIT
