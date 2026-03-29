import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { API_BASE_URL } from '../api/config';
import { Dumbbell, Play, Check, Timer, Award, Flame, Lightbulb, Moon, Video } from 'lucide-react';
import './FitnessTracker.css';

const FitnessTracker = () => {
  const { userId, plan } = useStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [workoutMode, setWorkoutMode] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    const todaysWorkout = plan?.workoutPlan?.find(w => w.day === today);
    if (todaysWorkout) {
      setSelectedDay(todaysWorkout);
    } else if (plan?.workoutPlan?.length > 0) {
      setSelectedDay(plan.workoutPlan[0]);
    }
  }, [plan]);

  useEffect(() => {
    fetchWorkoutHistory();
  }, [userId]);

  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      const timer = setTimeout(() => {
        setRestTimeLeft(restTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
    }
  }, [isResting, restTimeLeft]);

  const fetchWorkoutHistory = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${userId}`);
      const workouts = await response.json();
      setCompletedWorkouts(workouts);
      calculateStreak(workouts);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    }
  };

  const calculateStreak = (workouts) => {
    if (workouts.length === 0) {
      setStreak(0);
      return;
    }

    let streakCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasWorkout = workouts.some(w => w.completed_at.startsWith(dateStr));
      
      if (hasWorkout) {
        streakCount++;
      } else if (i > 0) {
        break;
      }
    }

    setStreak(streakCount);
    useStore.getState().updateWorkoutStreak(streakCount);
  };

  const startWorkout = () => {
    setWorkoutMode(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
  };

  const completeSet = () => {
    const exercise = selectedDay.exercises[currentExerciseIndex];
    
    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1);
      setIsResting(true);
      setRestTimeLeft(exercise.restSeconds);
    } else {
      if (currentExerciseIndex < selectedDay.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTimeLeft(selectedDay.exercises[currentExerciseIndex + 1].restSeconds);
      } else {
        completeWorkout();
      }
    }
  };

  const completeWorkout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/log/workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          workoutDay: selectedDay.day,
          exercises: selectedDay.exercises
        })
      });

      setWorkoutMode(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      showConfetti();
      fetchWorkoutHistory();
    } catch (error) {
      console.error('Failed to log workout:', error);
    }
  };

  const showConfetti = () => {
    const colors = ['#C8692A', '#E8A94D', '#A0522D'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const exitWorkout = () => {
    if (confirm('Are you sure you want to exit? Your progress will not be saved.')) {
      setWorkoutMode(false);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  if (!plan?.workoutPlan) return null;

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayName = weekDays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const weeklyCompletion = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  const totalWorkoutsThisWeek = plan.workoutPlan.filter(w => !w.isRestDay).length;
  const completionRate = totalWorkoutsThisWeek > 0 ? Math.round((weeklyCompletion / totalWorkoutsThisWeek) * 100) : 0;

  if (workoutMode && selectedDay) {
    const currentExercise = selectedDay.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex * 100) + ((currentSet - 1) / currentExercise.sets * 100)) / selectedDay.exercises.length;

    return (
      <div className="workout-mode">
        <div className="workout-mode-header">
          <button className="exit-btn" onClick={exitWorkout}>Exit</button>
          <div className="workout-progress-bar">
            <div className="workout-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="workout-mode-content">
          <div className="exercise-counter">
            Exercise {currentExerciseIndex + 1} of {selectedDay.exercises.length}
          </div>

          <h2 className="exercise-name">{currentExercise.name}</h2>

          <div className="set-info">
            <div className="set-counter">
              Set {currentSet} of {currentExercise.sets}
            </div>
            <div className="reps-info">{currentExercise.reps} reps</div>
          </div>

          {currentExercise.notes && (
            <div className="exercise-notes">
              <Lightbulb size={18} /> {currentExercise.notes}
            </div>
          )}

          {isResting ? (
            <div className="rest-timer pulse-glow">
              <Timer size={48} color="#C8692A" />
              <div className="rest-time">{restTimeLeft}s</div>
              <div className="rest-label">Rest Time</div>
            </div>
          ) : (
            <button className="complete-set-btn" onClick={completeSet}>
              <Check size={24} />
              Complete Set
            </button>
          )}

          <div className="sets-tracker">
            {Array.from({ length: currentExercise.sets }).map((_, i) => (
              <div 
                key={i} 
                className={`set-dot ${i < currentSet ? 'completed' : ''} ${i === currentSet - 1 ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fitness-tracker">
      <header className="page-header">
        <h1 className="page-title">Fitness Tracker</h1>
        <p className="page-subtitle">Your personalized workout plan</p>
      </header>

      <div className="fitness-content">
        <div className="stats-grid card-appear">
          <div className="stat-card">
            <Flame size={24} color="#C8692A" />
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <Award size={24} color="#C8692A" />
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Weekly Rate</div>
          </div>
          <div className="stat-card">
            <Dumbbell size={24} color="#C8692A" />
            <div className="stat-value">{completedWorkouts.length}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
        </div>

        <div className="week-calendar card-appear">
          <h3 className="calendar-title">Weekly Plan</h3>
          <div className="days-strip">
            {weekDays.map(day => {
              const workout = plan.workoutPlan.find(w => w.day === day);
              const isToday = day === todayName;
              const isSelected = selectedDay?.day === day;
              
              return (
                <button
                  key={day}
                  className={`day-pill ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${workout?.isRestDay ? 'rest' : ''}`}
                  onClick={() => setSelectedDay(workout)}
                >
                  <div className="day-name">{day.slice(0, 3)}</div>
                  {isToday && <div className="today-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDay && (
          <div className="workout-details card-appear">
            <div className="workout-header">
              <div>
                <h2 className="workout-day">{selectedDay.day}</h2>
                <h3 className="workout-focus">{selectedDay.focus}</h3>
              </div>
              {!selectedDay.isRestDay && (
                <div className="workout-duration">
                  <Timer size={18} />
                  ~{selectedDay.estimatedDuration} min
                </div>
              )}
            </div>

            {selectedDay.isRestDay ? (
              <div className="rest-day-info">
                <div className="rest-icon"><Moon size={64} color="#C8692A" /></div>
                <h3>Rest & Recovery</h3>
                <p>Your muscles need time to repair and grow. Take it easy today!</p>
              </div>
            ) : (
              <>
                <div className="exercises-list">
                  {selectedDay.exercises.map((exercise, index) => (
                    <div key={index} className="exercise-card">
                      <div className="exercise-header">
                        <div className="exercise-number">{index + 1}</div>
                        <div className="exercise-info">
                          <h4 className="exercise-title">{exercise.name}</h4>
                          <div className="exercise-meta">
                            <span className="sets-badge">{exercise.sets} sets</span>
                            <span className="reps-badge">{exercise.reps} reps</span>
                            <span className="rest-badge">{exercise.restSeconds}s rest</span>
                          </div>
                        </div>
                      </div>
                      {exercise.notes && (
                        <div className="exercise-note">{exercise.notes}</div>
                      )}
                      {exercise.videoSearchQuery && (
                        <a 
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoSearchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-link"
                        >
                          <Video size={16} /> Watch tutorial
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <button className="start-workout-btn" onClick={startWorkout}>
                  <Play size={20} />
                  Start Workout
                </button>
              </>
            )}
          </div>
        )}

        {completedWorkouts.length > 0 && (
          <div className="workout-history card-appear">
            <h3 className="history-title">Recent Workouts</h3>
            <div className="history-list">
              {completedWorkouts.slice(0, 5).map((workout, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    <Check size={16} color="white" />
                  </div>
                  <div className="history-info">
                    <div className="history-day">{workout.workoutDay}</div>
                    <div className="history-date">
                      {new Date(workout.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessTracker;
