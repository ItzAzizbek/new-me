import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_BASE_URL } from '../api/config';
import { User, Scale, TrendingDown, Calendar, Edit, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { userId, user, plan, daysUntilBirthday, bmi, clearUserData } = useStore();
  const [weightLogs, setWeightLogs] = useState([]);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    fetchWeightLogs();
  }, [userId]);

  const fetchWeightLogs = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/weight/${userId}`);
      const logs = await response.json();
      setWeightLogs(logs);
    } catch (error) {
      console.error('Failed to fetch weight logs:', error);
    }
  };

  const logWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;

    try {
      await fetch(`${API_BASE_URL}/api/log/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weight: parseFloat(newWeight)
        })
      });

      setNewWeight('');
      setShowWeightInput(false);
      fetchWeightLogs();
    } catch (error) {
      console.error('Failed to log weight:', error);
      alert('Failed to save weight. Please try again.');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to start over? This will clear all your data.')) {
      clearUserData();
      navigate('/onboarding');
    }
  };

  const currentWeight = weightLogs.length > 0 
    ? weightLogs[weightLogs.length - 1].weight 
    : user?.weight;

  const weightChange = weightLogs.length > 1
    ? currentWeight - weightLogs[0].weight
    : 0;

  const chartData = weightLogs.map(log => ({
    date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(log.weight.toFixed(1)),
    timestamp: new Date(log.logged_at).getTime()
  })).sort((a, b) => a.timestamp - b.timestamp);

  if (user?.weight && chartData.length === 0) {
    chartData.push({
      date: 'Start',
      weight: parseFloat(user.weight.toFixed(1)),
      timestamp: Date.now()
    });
  }

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const getWeightChangeColor = () => {
    if (weightChange < 0) return 'var(--color-success)';
    if (weightChange > 0) return 'var(--color-danger)';
    return 'var(--color-text-muted)';
  };

  return (
    <div className="profile">
      <header className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Track your transformation</p>
      </header>

      <div className="profile-content">
        <div className="profile-card card-appear">
          <div className="profile-avatar">
            <User size={48} color="#C8692A" />
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <div className="stat-label">Age</div>
              <div className="stat-value">{user?.age}</div>
            </div>
            <div className="profile-stat">
              <div className="stat-label">Gender</div>
              <div className="stat-value">{user?.gender}</div>
            </div>
            <div className="profile-stat">
              <div className="stat-label">Height</div>
              <div className="stat-value">{user?.height?.toFixed(0)} cm</div>
            </div>
          </div>
        </div>

        <div className="countdown-banner card-appear">
          <Calendar size={32} color="#C8692A" />
          <div className="countdown-info">
            <div className="countdown-days">{daysUntilBirthday}</div>
            <div className="countdown-text">days until your birthday</div>
          </div>
        </div>

        <div className="weight-card card-appear">
          <div className="card-header">
            <div className="card-title">
              <Scale size={20} color="#C8692A" />
              <span>Weight Progress</span>
            </div>
            <button className="log-weight-btn" onClick={() => setShowWeightInput(!showWeightInput)}>
              <Edit size={16} />
              Log Weight
            </button>
          </div>

          {showWeightInput && (
            <div className="weight-input-section slide-up">
              <input
                type="number"
                placeholder="Enter weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="weight-input"
                step="0.1"
              />
              <div className="weight-input-actions">
                <button className="cancel-btn" onClick={() => setShowWeightInput(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={logWeight}>
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="weight-summary">
            <div className="weight-stat">
              <div className="weight-label">Current</div>
              <div className="weight-value">{currentWeight?.toFixed(1)} kg</div>
            </div>
            <div className="weight-stat">
              <div className="weight-label">Target</div>
              <div className="weight-value">{plan?.targetWeight?.toFixed(1)} kg</div>
            </div>
            <div className="weight-stat">
              <div className="weight-label">Change</div>
              <div className="weight-value" style={{ color: getWeightChangeColor() }}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </div>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="weight-chart">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 105, 42, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8B6248"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <YAxis 
                    stroke="#8B6248"
                    style={{ fontSize: '0.85rem' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid rgba(200, 105, 42, 0.2)',
                      borderRadius: 'var(--radius-card)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <ReferenceLine 
                    y={plan?.targetWeight} 
                    stroke="#E8A94D" 
                    strokeDasharray="5 5"
                    label={{ value: 'Target', fill: '#E8A94D', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#C8692A" 
                    strokeWidth={3}
                    dot={{ fill: '#C8692A', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="health-metrics card-appear">
          <h3 className="metrics-title">Health Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">BMI</div>
              <div className="metric-value">{bmi?.toFixed(1)}</div>
              <div className="metric-category">{getBMICategory(bmi)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Daily Calories</div>
              <div className="metric-value">{plan?.dailyCalorieTarget?.toFixed(0)}</div>
              <div className="metric-category">Target</div>
            </div>
          </div>
        </div>

        <div className="goal-card card-appear">
          <div className="goal-header">
            <TrendingDown size={24} color="#C8692A" />
            <h3>Your Glow-Up Goal</h3>
          </div>
          <p className="goal-summary">{plan?.goalSummary}</p>
          <div className="goal-details">
            <div className="goal-detail">
              <span className="detail-label">Fitness Level:</span>
              <span className="detail-value">{plan?.fitnessLevel}</span>
            </div>
            <div className="goal-detail">
              <span className="detail-label">Gym Access:</span>
              <span className="detail-value">{user?.hasGymAccess ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default Profile;
