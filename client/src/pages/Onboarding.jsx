import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_BASE_URL } from '../api/config';
import { Sparkles, Dumbbell, Home } from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const setUserData = useStore((state) => state.setUserData);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    hasGymAccess: null,
    heightUnit: 'cm',
    weightUnit: 'kg'
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch(step) {
      case 1: return formData.name && formData.birthday;
      case 2: return formData.age && formData.gender;
      case 3: return formData.height && formData.weight;
      case 4: return formData.hasGymAccess !== null;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setStep(5);
    setLoading(true);

    try {
      let heightInCm = parseFloat(formData.height);
      let weightInKg = parseFloat(formData.weight);

      if (formData.heightUnit === 'ft') {
        heightInCm = heightInCm * 30.48;
      }
      if (formData.weightUnit === 'lbs') {
        weightInKg = weightInKg * 0.453592;
      }

      const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          birthday: formData.birthday,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: heightInCm,
          weight: weightInKg,
          hasGymAccess: formData.hasGymAccess
        })
      });

      const data = await response.json();
      
      setUserData({
        userId: data.userId,
        user: {
          name: formData.name,
          birthday: formData.birthday,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: heightInCm,
          weight: weightInKg,
          hasGymAccess: formData.hasGymAccess
        },
        plan: data.plan,
        daysUntilBirthday: data.daysUntilBirthday,
        bmi: data.bmi,
        tdee: data.tdee
      });

      setTimeout(() => {
        navigate('/app');
      }, 1500);

    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to create your plan. Please try again.');
      setStep(4);
      setLoading(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="onboarding">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="onboarding-content">
        {step === 1 && (
          <div className="step-content fade-in">
            <div className="brand-header">
              <Sparkles size={48} color="#C8692A" />
              <h1 className="brand-title">New Me</h1>
              <p className="brand-subtitle">Your personal glow-up journey starts here</p>
            </div>

            <div className="form-group">
              <label>What's your name?</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>When's your birthday?</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => updateField('birthday', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content fade-in">
            <h2 className="step-title">Tell us about yourself</h2>

            <div className="form-group">
              <label>How old are you?</label>
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="input-field"
                min="13"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <div className="option-cards">
                {['Male', 'Female', 'Other'].map(gender => (
                  <button
                    key={gender}
                    className={`option-card ${formData.gender === gender ? 'selected' : ''}`}
                    onClick={() => updateField('gender', gender)}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content fade-in">
            <h2 className="step-title">Your measurements</h2>

            <div className="form-group">
              <label>Height</label>
              <div className="measurement-input">
                <input
                  type="number"
                  placeholder="Height"
                  value={formData.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="input-field"
                  step="0.1"
                />
                <div className="unit-toggle">
                  <button
                    className={`unit-btn ${formData.heightUnit === 'cm' ? 'active' : ''}`}
                    onClick={() => updateField('heightUnit', 'cm')}
                  >
                    cm
                  </button>
                  <button
                    className={`unit-btn ${formData.heightUnit === 'ft' ? 'active' : ''}`}
                    onClick={() => updateField('heightUnit', 'ft')}
                  >
                    ft
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Weight</label>
              <div className="measurement-input">
                <input
                  type="number"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  className="input-field"
                  step="0.1"
                />
                <div className="unit-toggle">
                  <button
                    className={`unit-btn ${formData.weightUnit === 'kg' ? 'active' : ''}`}
                    onClick={() => updateField('weightUnit', 'kg')}
                  >
                    kg
                  </button>
                  <button
                    className={`unit-btn ${formData.weightUnit === 'lbs' ? 'active' : ''}`}
                    onClick={() => updateField('weightUnit', 'lbs')}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content fade-in">
            <h2 className="step-title">One last thing</h2>
            <p className="step-subtitle">This helps us create the perfect workout plan for you</p>

            <div className="form-group">
              <label>Do you have access to a gym?</label>
              <div className="option-cards large">
                <button
                  className={`option-card ${formData.hasGymAccess === true ? 'selected' : ''}`}
                  onClick={() => updateField('hasGymAccess', true)}
                >
                  <div className="option-icon"><Dumbbell size={40} color="#C8692A" /></div>
                  <div className="option-label">Yes</div>
                  <div className="option-desc">I have gym access</div>
                </button>
                <button
                  className={`option-card ${formData.hasGymAccess === false ? 'selected' : ''}`}
                  onClick={() => updateField('hasGymAccess', false)}
                >
                  <div className="option-icon"><Home size={40} color="#C8692A" /></div>
                  <div className="option-label">No</div>
                  <div className="option-desc">Home workouts only</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content loading-screen fade-in">
            <div className="loading-animation pulse-glow">
              <Sparkles size={64} color="#C8692A" />
            </div>
            <h2 className="loading-title">Creating your glow-up plan...</h2>
            <p className="loading-subtitle">AI is analyzing your goals and crafting a personalized journey</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {step < 5 && (
        <div className="onboarding-nav">
          {step > 1 && (
            <button className="nav-btn secondary" onClick={prevStep}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button 
              className="nav-btn primary" 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Continue
            </button>
          ) : (
            <button 
              className="nav-btn primary" 
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              Create My Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
