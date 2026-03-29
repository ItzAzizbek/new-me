# New Me 🌟

A full-stack mobile-first web app for personal transformation tracking. **New Me** helps users achieve their glow-up goals before their next birthday with AI-powered workout plans, meal tracking, and personalized guidance.

![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-orange)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-blue)

## ✨ Features

### 🎯 Smart Onboarding
- 5-step personalized onboarding flow
- AI-generated glow-up plan based on your goals, timeline, and gym access
- Realistic goal setting with edge case handling (short timelines)

### 📊 Dashboard
- Birthday countdown with animated progress ring
- Real-time calorie tracking with visual donut chart
- Today's workout preview
- Milestone tracker
- Daily motivational quotes

### 🍽️ AI-Powered Diet Tracker
- **Photo-based meal logging** using Google Gemini Vision
- Automatic calorie and macro estimation (protein, carbs, fat)
- Weekly calorie overview with charts
- Swipe-to-delete meal entries
- Daily calorie progress bar with color-coded feedback

### 💪 Fitness Tracker
- **AI-generated personalized workout plans**
- Gym vs. home workout customization
- Full-screen workout mode with:
  - Exercise-by-exercise guidance
  - Built-in rest timer with countdown
  - Set tracking with visual progress
  - Confetti celebration on completion
- Weekly calendar view
- Workout streak counter
- Exercise video tutorial links

### 📈 Profile & Progress
- Weight tracking with line chart visualization
- Target weight reference line
- BMI calculation and categorization
- Health metrics dashboard
- Complete transformation summary

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router v6 for navigation
- Zustand for state management
- Recharts for data visualization
- Lucide React for icons
- Custom CSS with warm color palette

**Backend:**
- Node.js + Express
- Google Generative AI SDK (Gemini 2.0 Flash)
- Better-SQLite3 for data persistence
- CORS enabled for local development

**AI Model:**
- Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`)
- Text generation for workout plans and onboarding
- Vision capabilities for meal photo analysis

## 🎨 Design System

**Color Palette:**
- Primary: Deep Amber `#C8692A`
- Surface: Soft Cream `#FDF6EC`
- Accent: Warm Gold `#E8A94D`
- Dark: Burnt Sienna `#A0522D`

**Typography:**
- Display: Playfair Display (serif)
- Body: Plus Jakarta Sans (sans-serif)

**Animations:**
- Card appear effects (scale + fade)
- Page transitions (slide up)
- Count-up animations
- Pulsing glow effects
- Confetti celebrations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
```bash
cd "d:/Bigger Projects/New Me"
```

2. **Set up the backend**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

4. **Set up the frontend**
```bash
cd ../frontend
npm install
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

Open your browser to `http://localhost:3000` and start your glow-up journey! 🎉

## 📱 Usage Flow

1. **Onboarding**: Enter your name, birthday, measurements, and gym access
2. **AI Plan Generation**: Wait for Gemini to create your personalized plan
3. **Dashboard**: View your countdown, calorie target, and today's workout
4. **Diet Tracking**: Take photos of meals for instant AI analysis
5. **Workout Mode**: Follow guided workouts with rest timers
6. **Progress Tracking**: Log weight and view transformation charts

## 🗄️ Database Schema

The app uses SQLite with the following tables:
- `users` - User profile data
- `plans` - AI-generated glow-up plans
- `meals` - Logged meals with nutrition data
- `workouts` - Completed workout sessions
- `weight_logs` - Weight tracking history

## 🔒 Privacy & Data

- All data stored locally in SQLite database
- No external authentication required
- Session-based with localStorage persistence
- Images stored as base64 in database (for MVP)

## 🎯 Future Enhancements

- [ ] User authentication with accounts
- [ ] Social features (share progress)
- [ ] Push notifications for workouts
- [ ] Apple Health / Google Fit integration
- [ ] Custom meal creation
- [ ] Recipe suggestions
- [ ] Progress photos gallery
- [ ] Export data as PDF report

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent plan generation
- Recharts for beautiful data visualization
- Lucide for clean, modern icons

---

**Built with ❤️ for anyone ready to become their best self.**
