# New Me - Setup Guide

## ✅ Installation Complete!

Both server and client dependencies have been installed successfully.

## 🔑 Required: Add Your Gemini API Key

1. **Get a Gemini API key** from [Google AI Studio](https://ai.google.dev/)

2. **Create `.env` file** in the `server` folder:
   ```bash
   cd server
   copy .env.example .env
   ```

3. **Edit `server/.env`** and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3001
   ```

## 🚀 Running the App

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Client will run on `http://localhost:3000`

### Option 2: Production Mode

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 🌐 Access the App

Open your browser to: **http://localhost:3000**

## 📝 Important Notes

- **Data Storage**: The app now uses **in-memory storage** (no database file needed)
- **Data Persistence**: Data will be lost when the server restarts
- **Session**: Your user data is stored in browser localStorage
- **API Key**: Make sure your Gemini API key is valid and has credits

## 🎯 First Time Use

1. Complete the 5-step onboarding
2. Wait for AI to generate your personalized plan (~10-20 seconds)
3. Start tracking meals, workouts, and weight!

## 🐛 Troubleshooting

**Server won't start:**
- Check if `.env` file exists in `server` folder
- Verify your Gemini API key is correct
- Make sure port 3001 is not in use

**Client won't start:**
- Make sure server is running first
- Check if port 3000 is available
- Clear browser cache if needed

**AI features not working:**
- Verify Gemini API key is valid
- Check server console for error messages
- Ensure you have internet connection

## 📦 What Was Fixed

The original setup used `better-sqlite3` which requires Visual Studio Build Tools on Windows. This has been replaced with a simple in-memory storage solution that works on all platforms without any native compilation.

**Trade-off:** Data is not persisted to disk, but the app is now much easier to set up and run!

---

**Ready to start your glow-up journey! 🌟**
