import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import WorkoutList from './pages/WorkoutList';
import WorkoutCreate from './pages/WorkoutCreate';
import WorkoutDetail from './pages/WorkoutDetail';
import WorkoutEdit from './pages/WorkoutEdit';
import DietList from './pages/DietList';
import DietCreate from './pages/DietCreate';
import DietDetail from './pages/DietDetail';
import DietEdit from './pages/DietEdit';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;