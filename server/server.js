require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['https://new-age-new-me.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

const db = {
  users: new Map(),
  plans: new Map(),
  meals: [],
  workouts: [],
  weightLogs: [],
  mealIdCounter: 1,
  workoutIdCounter: 1,
  weightLogIdCounter: 1
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function calculateBMI(weight, height) {
  return weight / ((height / 100) ** 2);
}

function calculateTDEE(weight, height, age, gender) {
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return bmr * 1.55;
}

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

function stripMarkdownFences(text) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

app.post('/api/onboarding', async (req, res) => {
  try {
    const { name, birthday, age, gender, height, weight, hasGymAccess } = req.body;
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const birthdayDate = new Date(birthday);
    const today = new Date();
    let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = daysBetween(today, nextBirthday);
    const weeksUntilBirthday = Math.floor(daysUntilBirthday / 7);
    
    const bmi = calculateBMI(weight, height);
    const tdee = calculateTDEE(weight, height, age, gender);
    
    db.users.set(userId, {
      id: userId,
      name,
      birthday,
      age,
      gender,
      height,
      weight,
      hasGymAccess,
      created_at: new Date().toISOString()
    });
    
    const isShortTimeline = daysUntilBirthday < 30;
    
    const systemInstruction = 'You are a fitness and wellness AI coach. Always respond with valid JSON only. No markdown, no explanation, no code fences.';
    
    const prompt = `${systemInstruction}

Create a personalized glow-up plan for a user with the following details:

Name: ${name}
Age: ${age}
Gender: ${gender}
Height: ${height} cm
Current Weight: ${weight} kg
BMI: ${bmi.toFixed(1)}
TDEE: ${tdee.toFixed(0)} calories/day
Days until birthday: ${daysUntilBirthday}
Weeks available: ${weeksUntilBirthday}
Has gym access: ${hasGymAccess ? 'Yes' : 'No'}

${isShortTimeline ? 'IMPORTANT: The user has less than 30 days. Set minimal, achievable goals focused on building habits and feeling better. Do not promise dramatic transformations.' : ''}

Create a realistic, motivating plan. Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "goalSummary": "A warm, encouraging 2-sentence summary of what's realistically achievable",
  "targetWeight": number (realistic target weight in kg),
  "weeklyCalorieTarget": number (weekly average calories),
  "dailyCalorieTarget": number (daily calorie target),
  "fitnessLevel": "beginner" or "intermediate" or "advanced",
  "workoutPlan": [
    {
      "day": "Monday",
      "focus": "Upper Body Strength",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "12-15",
          "restSeconds": 60,
          "notes": "Keep core tight",
          "videoSearchQuery": "push-up form tutorial"
        }
      ],
      "estimatedDuration": 35,
      "isRestDay": false
    }
  ],
  "milestones": [
    { "week": 1, "description": "Build the habit" },
    { "week": 2, "description": "Notice energy increase" }
  ]
}

Generate a ${weeksUntilBirthday}-week plan (max 12 weeks). Include 2 rest days per week. ${hasGymAccess ? 'Include gym exercises (compound lifts + isolation).' : 'Use only bodyweight exercises.'}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = stripMarkdownFences(responseText);
    const plan = JSON.parse(cleanedText);
    
    db.plans.set(userId, {
      userId,
      goalSummary: plan.goalSummary,
      targetWeight: plan.targetWeight,
      weeklyCalorieTarget: plan.weeklyCalorieTarget,
      dailyCalorieTarget: plan.dailyCalorieTarget,
      fitnessLevel: plan.fitnessLevel,
      workoutPlan: plan.workoutPlan,
      milestones: plan.milestones,
      created_at: new Date().toISOString()
    });
    
    res.json({
      userId,
      daysUntilBirthday,
      bmi: parseFloat(bmi.toFixed(1)),
      tdee: parseFloat(tdee.toFixed(0)),
      plan
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to generate plan', details: error.message });
  }
});

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { image, mimeType, userId } = req.body;
    
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Image and mimeType required' });
    }
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });
    
    const systemInstruction = 'You are a nutrition AI. Analyze food images and return valid JSON only. No markdown, no explanation, no code fences.';
    
    const prompt = `${systemInstruction}
    
Analyze this food image. Estimate the nutritional content. Return ONLY valid JSON with this exact structure:
{
  "foodName": "descriptive name of the food",
  "estimatedCalories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "portionNote": "brief note on assumed portion size"
}`;
    
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Data } },
      { text: prompt }
    ]);
    
    const responseText = result.response.text();
    const cleanedText = stripMarkdownFences(responseText);
    const analysis = JSON.parse(cleanedText);
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Meal analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze meal', details: error.message });
  }
});

app.post('/api/log/meal', async (req, res) => {
  try {
    const { userId, foodName, estimatedCalories, protein, carbs, fat, portionNote, imageData } = req.body;
    
    const mealId = db.mealIdCounter++;
    const meal = {
      id: mealId,
      userId,
      foodName,
      estimatedCalories,
      protein,
      carbs,
      fat,
      portionNote,
      imageData: imageData || null,
      logged_at: new Date().toISOString()
    };
    
    db.meals.push(meal);
    
    res.json({ success: true, mealId });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

app.get('/api/meals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    let meals = db.meals.filter(m => m.userId === userId);
    
    if (date) {
      meals = meals.filter(m => m.logged_at.startsWith(date));
    }
    
    meals.sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));
    
    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

app.delete('/api/meals/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;
    const index = db.meals.findIndex(m => m.id === parseInt(mealId));
    if (index !== -1) {
      db.meals.splice(index, 1);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

app.post('/api/log/workout', async (req, res) => {
  try {
    const { userId, workoutDay, exercises } = req.body;
    
    const workoutId = db.workoutIdCounter++;
    const workout = {
      id: workoutId,
      userId,
      workoutDay,
      exercises,
      completed_at: new Date().toISOString()
    };
    
    db.workouts.push(workout);
    
    res.json({ success: true, workoutId });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

app.get('/api/workouts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const workouts = db.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 30);
    
    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

app.post('/api/log/weight', async (req, res) => {
  try {
    const { userId, weight } = req.body;
    
    const logId = db.weightLogIdCounter++;
    const weightLog = {
      id: logId,
      userId,
      weight,
      logged_at: new Date().toISOString()
    };
    
    db.weightLogs.push(weightLog);
    
    res.json({ success: true, logId });
  } catch (error) {
    console.error('Log weight error:', error);
    res.status(500).json({ error: 'Failed to log weight' });
  }
});

app.get('/api/weight/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = db.weightLogs
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
    res.json(logs);
  } catch (error) {
    console.error('Get weight logs error:', error);
    res.status(500).json({ error: 'Failed to fetch weight logs' });
  }
});

app.get('/api/plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const plan = db.plans.get(userId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const user = db.users.get(userId);
    
    res.json({
      ...plan,
      user
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

app.post('/api/update-plan', async (req, res) => {
  try {
    const { userId, newTargetWeight, newDailyCalorieTarget } = req.body;
    
    const user = db.users.get(userId);
    const currentPlan = db.plans.get(userId);
    
    if (!user || !currentPlan) {
      return res.status(404).json({ error: 'User or plan not found' });
    }

    const bmi = calculateBMI(user.weight, user.height);
    const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender);
    
    const systemInstruction = 'You are a fitness and wellness AI coach. Always respond with valid JSON only. No markdown, no explanation, no code fences.';
    
    const prompt = `${systemInstruction}
    
The user wants to update their fitness goals.
Current Profile:
Name: ${user.name}
Age: ${user.age}
Gender: ${user.gender}
Height: ${user.height} cm
Current Weight: ${user.weight} kg
BMI: ${bmi.toFixed(1)}
TDEE: ${tdee.toFixed(0)} calories/day

New Requested Goals:
Target Weight: ${newTargetWeight} kg
Daily Calorie Target: ${newDailyCalorieTarget} calories

Your Task:
1. Check if these goals are realistic.
   - Losing more than 1kg per week is generally unrealistic.
   - Daily calories below 1200 for women or 1500 for men are generally unsafe.
2. If the goal is unrealistic, provide a helpful reason and a suggested realistic alternative.
3. If the goal is realistic, generate an updated plan (goalSummary, workoutPlan, milestones).

Return ONLY valid JSON with this structure:
{
  "realistic": boolean,
  "reason": "explanation if unrealistic, or empty string",
  "suggestedWeight": number (only if unrealistic),
  "suggestedCalories": number (only if unrealistic),
  "updatedPlan": {
    "goalSummary": "2-sentence updated summary",
    "targetWeight": number,
    "dailyCalorieTarget": number,
    "fitnessLevel": "${currentPlan.fitnessLevel}",
    "workoutPlan": [ ... same structure as onboarding ... ],
    "milestones": [ ... same structure as onboarding ... ]
  }
}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = stripMarkdownFences(responseText);
    const evaluation = JSON.parse(cleanedText);
    
    if (evaluation.realistic) {
      const updatedPlan = {
        userId,
        ...evaluation.updatedPlan,
        weeklyCalorieTarget: evaluation.updatedPlan.dailyCalorieTarget * 7,
        created_at: new Date().toISOString()
      };
      
      db.plans.set(userId, updatedPlan);
      res.json({ success: true, plan: updatedPlan });
    } else {
      res.json({ success: false, reason: evaluation.reason, suggestedWeight: evaluation.suggestedWeight, suggestedCalories: evaluation.suggestedCalories });
    }
    
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan', details: error.message });
  }
});

app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const meals = db.meals
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))
      .slice(0, 100);
      
    const workouts = db.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 30);
      
    const weightLogs = db.weightLogs
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
    
    res.json({
      meals,
      workouts,
      weightLogs
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 New Me backend running on http://localhost:${PORT}`);
});
