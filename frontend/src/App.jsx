import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import MyFeedbacksPage from './components/MyFeedbacksPage';
import DeveloperDashboard from './components/DeveloperDashboard';
import DeveloperLayout from './components/DeveloperLayout';
import DeveloperAssignedTasks from './components/DeveloperAssignedTasks';
import DeveloperFeedbackToFix from './components/DeveloperFeedbackToFix';
import DeveloperProgress from './components/DeveloperProgress';
import { useAuth } from './components/AuthProvider';

import AdminLayout from './components/AdminLayout';
import UsersPage from './components/UsersPage';
import AssignDeveloperPage from './components/AssignDeveloperPage';
import AdminDashboard from './components/AdminDashboard';
import AllFeedbacksPage from './components/AllFeedbacksPage';
import UserProfile from './components/UserProfile';
import UserLayout from './components/UserLayout';
import SettingsPage from './components/SettingsPage';

import HomePage from './components/HomePage';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return (
    <>
      {React.cloneElement(children, { onProfileClick: () => setShowProfile(true) })}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
};

const App = () => {
  return (

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="my-feedbacks" element={<MyFeedbacksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="assign" element={<AssignDeveloperPage />} />
        <Route path="feedbacks" element={<AllFeedbacksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/developer"
        element={
          <ProtectedRoute role="developer">
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeveloperDashboard />} />
        <Route path="tasks" element={<DeveloperAssignedTasks />} />
        <Route path="feedback-to-fix" element={<DeveloperFeedbackToFix />} />
        <Route path="progress" element={<DeveloperProgress />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
