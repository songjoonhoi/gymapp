import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Common
import Login from './pages/common/Login';
import Register from './pages/common/Register';

// Member
import Home from './pages/member/Home';
import WorkoutList from './pages/member/WorkoutList';
import WorkoutCreate from './pages/member/WorkoutCreate';
import WorkoutDetail from './pages/member/WorkoutDetail';
import WorkoutEdit from './pages/member/WorkoutEdit';
import DietList from './pages/member/DietList';
import DietCreate from './pages/member/DietCreate';
import DietDetail from './pages/member/DietDetail';
import DietEdit from './pages/member/DietEdit';
import Profile from './pages/member/Profile';
import PasswordChange from './pages/member/PasswordChange';
import Statistics from './pages/member/Statistics';
import Notifications from './pages/member/Notifications';
import Membership from './pages/member/Membership';


// Trainer
import TrainerMembers from './pages/trainer/TrainerMembers';
import MemberDashboard from './pages/trainer/MemberDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Member Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/workout" element={<WorkoutList />} />
          <Route path="/workout/create" element={<WorkoutCreate />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/workout/edit/:id" element={<WorkoutEdit />} />
          <Route path="/diet" element={<DietList />} />
          <Route path="/diet/create" element={<DietCreate />} />
          <Route path="/diet/:id" element={<DietDetail />} />
          <Route path="/diet/edit/:id" element={<DietEdit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/password-change" element={<PasswordChange />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/membership" element={<Membership />} />
          
          {/* Trainer Routes */}
          <Route path="/trainer/members" element={<TrainerMembers />} />
          <Route path="/trainer/members/:memberId" element={<MemberDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;