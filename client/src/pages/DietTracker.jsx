import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { API_BASE_URL } from '../api/config';
import { Plus, Camera, X, Check, Trash2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import './DietTracker.css';

const DietTracker = () => {
  const { userId, plan, todaysMeals, todaysCalories, addMeal, removeMeal, setTodaysMeals } = useStore();
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTodaysMeals();
    fetchWeeklyData();
  }, [userId]);

  const fetchTodaysMeals = async () => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/api/meals/${userId}?date=${today}`);
      const meals = await response.json();
      setTodaysMeals(meals);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    }
  };

  const fetchWeeklyData = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/meals/${userId}`);
      const allMeals = await response.json();
      
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayMeals = allMeals.filter(m => m.logged_at.startsWith(dateStr));
        const totalCals = dayMeals.reduce((sum, m) => sum + m.estimatedCalories, 0);
        
        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          calories: Math.round(totalCals),
          target: plan?.dailyCalorieTarget || 2000
        });
      }
      
      setWeeklyData(last7Days);
    } catch (error) {
      console.error('Failed to fetch weekly data:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      analyzeMeal(event.target.result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeMeal = async (imageData, mimeType) => {
    setAnalyzing(true);
    setShowCamera(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          mimeType,
          userId
        })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze meal. Please try again.');
      setSelectedImage(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmMeal = async () => {
    if (!analysis) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/log/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...analysis,
          imageData: selectedImage
        })
      });

      const result = await response.json();
      
      addMeal({
        id: result.mealId,
        ...analysis,
        logged_at: new Date().toISOString()
      });

      setAnalysis(null);
      setSelectedImage(null);
      fetchWeeklyData();
    } catch (error) {
      console.error('Failed to log meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      await fetch(`${API_BASE_URL}/api/meals/${mealId}`, { method: 'DELETE' });
      removeMeal(mealId);
      fetchWeeklyData();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const cancelAnalysis = () => {
    setAnalysis(null);
    setSelectedImage(null);
  };

  const calorieTarget = plan?.dailyCalorieTarget || 2000;
  const caloriePercentage = Math.min((todaysCalories / calorieTarget) * 100, 100);
  const caloriesRemaining = Math.max(calorieTarget - todaysCalories, 0);

  const getProgressColor = () => {
    if (caloriePercentage < 70) return 'var(--color-success)';
    if (caloriePercentage < 90) return 'var(--color-accent)';
    return 'var(--color-danger)';
  };

  const totalProtein = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todaysMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = todaysMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  return (
    <div className="diet-tracker">
      <header className="page-header">
        <h1 className="page-title">Diet Tracker</h1>
        <p className="page-subtitle">Track your nutrition with AI</p>
      </header>

      <div className="diet-content">
        <div className="calorie-progress-card card-appear">
          <div className="progress-header">
            <div className="progress-info">
              <div className="calories-consumed">{Math.round(todaysCalories)}</div>
              <div className="calories-label">of {Math.round(calorieTarget)} cal</div>
            </div>
            <div className="calories-remaining-badge">
              {Math.round(caloriesRemaining)} left
            </div>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${caloriePercentage}%`,
                background: getProgressColor()
              }}
            />
          </div>
          <div className="macros-summary">
            <div className="macro">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{Math.round(totalProtein)}g</span>
            </div>
            <div className="macro">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="macro">
              <span className="macro-label">Fat</span>
              <span className="macro-value">{Math.round(totalFat)}g</span>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="analysis-result card-appear slide-up">
            <div className="analysis-header">
              <h3>Meal Analysis</h3>
              <button className="icon-btn" onClick={cancelAnalysis}>
                <X size={20} />
              </button>
            </div>
            {selectedImage && (
              <img src={selectedImage} alt="Meal" className="meal-preview" />
            )}
            <div className="analysis-details">
              <h4 className="food-name">{analysis.foodName}</h4>
              <div className="calorie-badge">{Math.round(analysis.estimatedCalories)} calories</div>
              <div className="macros-grid">
                <div className="macro-pill">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">{Math.round(analysis.protein)}g</span>
                </div>
                <div className="macro-pill">
                  <span className="macro-label">Carbs</span>
                  <span className="macro-value">{Math.round(analysis.carbs)}g</span>
                </div>
                <div className="macro-pill">
                  <span className="macro-label">Fat</span>
                  <span className="macro-value">{Math.round(analysis.fat)}g</span>
                </div>
              </div>
              <p className="portion-note">{analysis.portionNote}</p>
            </div>
            <div className="analysis-actions">
              <button className="action-btn secondary" onClick={cancelAnalysis}>
                Edit
              </button>
              <button className="action-btn primary" onClick={confirmMeal}>
                <Check size={18} />
                Confirm
              </button>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="analyzing-card card-appear">
            <div className="analyzing-spinner pulse-glow" />
            <p>Analyzing your meal...</p>
          </div>
        )}

        <div className="meals-section">
          <h2 className="section-title">Today's Meals</h2>
          {todaysMeals.length === 0 ? (
            <div className="empty-state">
              <Camera size={48} color="#C8692A" opacity={0.3} />
              <p>No meals logged yet</p>
              <span>Tap the + button to log your first meal</span>
            </div>
          ) : (
            <div className="meals-list">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="meal-item card-appear">
                  {meal.imageData && (
                    <img src={meal.imageData} alt={meal.foodName} className="meal-thumb" />
                  )}
                  <div className="meal-info">
                    <h4 className="meal-name">{meal.foodName}</h4>
                    <div className="meal-calories">{Math.round(meal.estimatedCalories)} cal</div>
                    <div className="meal-macros">
                      P: {Math.round(meal.protein)}g • C: {Math.round(meal.carbs)}g • F: {Math.round(meal.fat)}g
                    </div>
                    <div className="meal-time">
                      {new Date(meal.logged_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteMeal(meal.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {weeklyData.length > 0 && (
          <div className="weekly-chart-card card-appear">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={20} color="#C8692A" />
                <span>Weekly Overview</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 105, 42, 0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="#8B6248"
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis 
                  stroke="#8B6248"
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid rgba(200, 105, 42, 0.2)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Bar dataKey="calories" fill="#C8692A" radius={[8, 8, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#E8A94D" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <button 
        className="fab"
        onClick={() => fileInputRef.current?.click()}
        disabled={analyzing}
      >
        <Plus size={28} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DietTracker;
