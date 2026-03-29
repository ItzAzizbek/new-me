import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Onboarding from './pages/Onboarding';
import MainApp from './pages/MainApp';

function App() {
  const userId = useStore((state) => state.userId);

  return (
    <Router>
      <Routes>
        <Route 
          path="/onboarding" 
          element={userId ? <Navigate to="/app" replace /> : <Onboarding />} 
        />
        <Route 
          path="/app/*" 
          element={userId ? <MainApp /> : <Navigate to="/onboarding" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={userId ? "/app" : "/onboarding"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
