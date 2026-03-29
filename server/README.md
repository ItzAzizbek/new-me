# New Me Backend

Node.js + Express API server with Google Gemini AI integration.

## API Endpoints

### Onboarding
**POST** `/api/onboarding`
- Creates user profile and generates AI-powered glow-up plan
- Body: `{ name, birthday, age, gender, height, weight, hasGymAccess }`
- Returns: `{ userId, daysUntilBirthday, bmi, tdee, plan }`

### Meal Analysis
**POST** `/api/analyze-meal`
- Analyzes food photo using Gemini Vision
- Body: `{ image: base64string, mimeType, userId }`
- Returns: `{ foodName, estimatedCalories, protein, carbs, fat, portionNote }`

### Meal Logging
**POST** `/api/log/meal`
- Saves meal entry to database
- Body: `{ userId, foodName, estimatedCalories, protein, carbs, fat, portionNote, imageData }`

**GET** `/api/meals/:userId?date=YYYY-MM-DD`
- Retrieves meals for user (optionally filtered by date)

**DELETE** `/api/meals/:mealId`
- Deletes a meal entry

### Workout Logging
**POST** `/api/log/workout`
- Logs completed workout
- Body: `{ userId, workoutDay, exercises }`

**GET** `/api/workouts/:userId`
- Retrieves workout history (last 30)

### Weight Tracking
**POST** `/api/log/weight`
- Logs weight measurement
- Body: `{ userId, weight }`

**GET** `/api/weight/:userId`
- Retrieves all weight logs

### Plan Retrieval
**GET** `/api/plan/:userId`
- Retrieves user's glow-up plan and profile

**GET** `/api/progress/:userId`
- Retrieves all progress data (meals, workouts, weight logs)

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

## Database

SQLite database (`newme.db`) with automatic schema creation on first run.

## Running

```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```
