import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Sparkles, Flame, Calendar, TrendingUp, Dumbbell, Smile, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, plan, daysUntilBirthday, todaysCalories, userId } = useStore();
  const [quote, setQuote] = useState('');
  const [currentMilestone, setCurrentMilestone] = useState(null);

  useEffect(() => {
    const quotes = [
      "Every small step is progress toward your best self.",
      "You're not just changing your body, you're transforming your life.",
      "Consistency beats perfection every single time.",
      "Your future self will thank you for starting today.",
      "The glow-up is happening, one day at a time.",
      "You're stronger than you think, and you're proving it daily.",
      "This journey is yours, and you're crushing it."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    if (plan?.milestones) {
      const weeksElapsed = Math.floor((new Date() - new Date(user?.created_at || Date.now())) / (7 * 24 * 60 * 60 * 1000));
      const upcoming = plan.milestones.find(m => m.week >= weeksElapsed);
      setCurrentMilestone(upcoming || plan.milestones[plan.milestones.length - 1]);
    }
  }, [plan, user]);

  useEffect(() => {
    const fetchTodaysMeals = async () => {
      if (!userId) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/meals/${userId}?date=${today}`);
        const meals = await response.json();
        useStore.getState().setTodaysMeals(meals);
      } catch (error) {
        console.error('Failed to fetch meals:', error);
      }
    };
    fetchTodaysMeals();
  }, [userId]);

  if (!plan) return null;

  const calorieTarget = plan.dailyCalorieTarget;
  const caloriePercentage = Math.min((todaysCalories / calorieTarget) * 100, 100);
  const caloriesRemaining = Math.max(calorieTarget - todaysCalories, 0);

  const getCalorieColor = () => {
    if (caloriePercentage < 70) return '#5C8A5C';
    if (caloriePercentage < 90) return '#E8A94D';
    return '#C0392B';
  };

  const pieData = [
    { value: todaysCalories, color: getCalorieColor() },
    { value: caloriesRemaining, color: 'rgba(200, 105, 42, 0.1)' }
  ];

  const getTodaysWorkout = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    return plan.workoutPlan?.find(w => w.day === today);
  };

  const todaysWorkout = getTodaysWorkout();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">New Me</h1>
          <p className="dashboard-greeting">Hey {user?.name || 'there'} <Smile size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /></p>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="countdown-card card-appear">
          <div className="countdown-icon">
            <Calendar size={32} color="#C8692A" />
          </div>
          <div className="countdown-content">
            <div className="countdown-number count-up">{daysUntilBirthday}</div>
            <div className="countdown-label">days until your glow-up</div>
          </div>
          <div className="countdown-ring">
            <svg viewBox="0 0 100 100" className="ring-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(200, 105, 42, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(daysUntilBirthday / 365, 1))}`}
                transform="rotate(-90 50 50)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C8692A" />
                  <stop offset="100%" stopColor="#E8A94D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="calorie-card card-appear">
          <div className="card-header">
            <div className="card-title">
              <Flame size={20} color="#C8692A" />
              <span>Today's Calories</span>
            </div>
          </div>
          <div className="calorie-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="calorie-center">
              <div className="calorie-consumed">{Math.round(todaysCalories)}</div>
              <div className="calorie-target">of {Math.round(calorieTarget)}</div>
            </div>
          </div>
          <div className="calorie-footer">
            <span className="calories-remaining">{Math.round(caloriesRemaining)} cal remaining</span>
          </div>
        </div>

        {todaysWorkout && (
          <div className="workout-card card-appear" onClick={() => navigate('/app/fitness')}>
            <div className="card-header">
              <div className="card-title">
                <Dumbbell size={20} color="#C8692A" />
                <span>Today's Workout</span>
              </div>
              <div className="workout-badge">{todaysWorkout.day}</div>
            </div>
            <div className="workout-info">
              <h3 className="workout-focus">{todaysWorkout.focus}</h3>
              <div className="workout-meta">
                <span>{todaysWorkout.exercises?.length || 0} exercises</span>
                <span>•</span>
                <span>~{todaysWorkout.estimatedDuration} min</span>
              </div>
            </div>
            <button className="workout-cta">Start Workout</button>
          </div>
        )}

        {todaysWorkout?.isRestDay && (
          <div className="rest-day-card card-appear">
            <div className="rest-icon"><Moon size={40} color="#C8692A" /></div>
            <h3>Rest Day</h3>
            <p>Your body needs recovery. Take it easy today!</p>
          </div>
        )}

        {currentMilestone && (
          <div className="milestone-card card-appear">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={20} color="#C8692A" />
                <span>Upcoming Milestone</span>
              </div>
            </div>
            <div className="milestone-content">
              <div className="milestone-week">Week {currentMilestone.week}</div>
              <div className="milestone-desc">{currentMilestone.description}</div>
            </div>
          </div>
        )}

        <div className="quote-card card-appear">
          <Sparkles size={24} color="#E8A94D" className="quote-icon" />
          <p className="quote-text">"{quote}"</p>
        </div>

        <div className="goal-summary-card card-appear">
          <h3 className="goal-title">Your Glow-Up Plan</h3>
          <p className="goal-text">{plan.goalSummary}</p>
          <div className="goal-stats">
            <div className="stat">
              <div className="stat-label">Target Weight</div>
              <div className="stat-value">{plan.targetWeight} kg</div>
            </div>
            <div className="stat">
              <div className="stat-label">Fitness Level</div>
              <div className="stat-value">{plan.fitnessLevel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
