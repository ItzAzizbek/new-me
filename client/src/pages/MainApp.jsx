import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, Dumbbell, User } from 'lucide-react';
import Dashboard from './Dashboard';
import DietTracker from './DietTracker';
import FitnessTracker from './FitnessTracker';
import Profile from './Profile';
import './MainApp.css';

const MainApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/app', icon: Home, label: 'Home' },
    { path: '/app/diet', icon: UtensilsCrossed, label: 'Diet' },
    { path: '/app/fitness', icon: Dumbbell, label: 'Fitness' },
    { path: '/app/profile', icon: User, label: 'Profile' }
  ];

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="main-app">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diet" element={<DietTracker />} />
          <Route path="/fitness" element={<FitnessTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </div>

      <nav className="bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MainApp;
