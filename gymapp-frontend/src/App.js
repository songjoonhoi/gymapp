import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Common
import Login from './pages/common/Login';
import Register from './pages/common/Register';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers'; 
import AdminMemberDetail from './pages/admin/AdminMemberDetail';  
import AdminTrainers from './pages/admin/AdminTrainers'; 
import AdminTrainerDetail from './pages/admin/AdminTrainerDetail';  
import AdminStatistics from './pages/admin/AdminStatistics';
import AdminMemberRegister from './pages/admin/AdminMemberRegister';
import AdminTrainerRegister from './pages/admin/AdminTrainerRegister';

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
import MyPtSessions from './pages/member/MyPtSessions';



// Trainer
import TrainerMembers from './pages/trainer/TrainerMembers';
import MemberDashboard from './pages/trainer/MemberDashboard';
import MemberWorkoutList from './pages/trainer/MemberWorkoutList';
import MemberWorkoutCreate from './pages/trainer/MemberWorkoutCreate';
import MemberWorkoutDetail from './pages/trainer/MemberWorkoutDetail';
import MemberWorkoutEdit from './pages/trainer/MemberWorkoutEdit';
import MemberDietList from './pages/trainer/MemberDietList';
import MemberDietDetail from './pages/trainer/MemberDietDetail';
import MembershipRegister from './pages/trainer/MembershipRegister';
import MembershipDecrement from './pages/trainer/MembershipDecrement';
import MembershipAlerts from './pages/trainer/MembershipAlerts';
import PTSessionOverview from './pages/trainer/PTSessionOverview';
import MembershipHistory from './pages/trainer/MembershipHistory';
import MemberDietCreate from './pages/trainer/MemberDietCreate';
import MemberDietEdit from './pages/trainer/MemberDietEdit';
import TrainerStatistics from './pages/trainer/TrainerStatistics';
import TrainerMemberRegister from './pages/trainer/TrainerMemberRegister';
import PtSessionCreate from './pages/trainer/PtSessionCreate';
import MemberPtSessions from './pages/trainer/MemberPtSessions';
import PtSessionDetail from './pages/trainer/PtSessionDetail';
import PtSessionEdit from './pages/trainer/PtSessionEdit';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/members/register" element={<AdminMemberRegister />} />
          <Route path="/admin/members/:id" element={<AdminMemberDetail />} />
          <Route path="/admin/trainers" element={<AdminTrainers />} />
          <Route path="/admin/trainers/:id" element={<AdminTrainerDetail />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />
          <Route path="/admin/trainers/register" element={<AdminTrainerRegister />} />

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
          <Route path="/my-pt-sessions" element={<MyPtSessions />} />
          
          
          {/* Trainer Routes */}
          <Route path="/trainer/members" element={<TrainerMembers />} />
          <Route path="/trainer/members/:memberId" element={<MemberDashboard />} />
          <Route path="/trainer/members/:memberId/workout" element={<MemberWorkoutList />} />
          <Route path="/trainer/members/:memberId/workout/create" element={<MemberWorkoutCreate />} />
          <Route path="/trainer/members/:memberId/workout/:workoutId" element={<MemberWorkoutDetail />} />
          <Route path="/trainer/members/:memberId/workout/edit/:workoutId" element={<MemberWorkoutEdit />} />
          <Route path="/trainer/members/:memberId/diet" element={<MemberDietList />} />
          <Route path="/trainer/members/:memberId/diet/:dietId" element={<MemberDietDetail />} />
          <Route path="/trainer/members/:memberId/membership/register" element={<MembershipRegister />} />
          <Route path="/trainer/members/:memberId/membership/decrement" element={<MembershipDecrement />} />
          <Route path="/trainer/membership-alerts" element={<MembershipAlerts />} />
          <Route path="/trainer/pt-sessions" element={<PTSessionOverview />} />
          <Route path="/trainer/members/:memberId/membership/history" element={<MembershipHistory />} />
          <Route path="/trainer/members/:memberId/diet/create" element={<MemberDietCreate />} />
          <Route path="/trainer/members/:memberId/diet/edit/:dietId" element={<MemberDietEdit />} />
          <Route path="/trainer/statistics" element={<TrainerStatistics />} />
          <Route path="/trainer/members/register" element={<TrainerMemberRegister />} />
          <Route path="/trainer/members/:memberId/pt/create" element={<PtSessionCreate />} />
          <Route path="/trainer/members/:memberId/pt/:sessionId/edit" element={<PtSessionEdit />} />
          <Route path="/trainer/members/:memberId/pt/:sessionId" element={<PtSessionDetail />} />
          <Route path="/trainer/members/:memberId/pt" element={<MemberPtSessions />} />
        </Routes>

        

      </div>
    </Router>
  );
}

export default App;