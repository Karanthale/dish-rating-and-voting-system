import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from './utils/auth';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import RatingPage from './pages/RatingPage';
import ViewReviews from './pages/ViewReviews';
import ComparePage from './pages/ComparePage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard'; // <-- NEW IMPORT

// Helper to check for owner role (Reads from localStorage just like Auth.jsx)
const isOwner = () => localStorage.getItem('userRole') === 'owner';

// Protected Route Components
const ProtectedRoute = ({ children, adminOnly = false, ownerOnly = false, studentOnly = false }) => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    // 1. If not logged in, go to login page
    if (!token) return <Navigate to="/auth" replace />;

    // 2. Protect Admin Routes
    if (adminOnly && role !== 'admin') return <Navigate to="/dashboard" replace />;

    // 3. Protect Owner Routes
    if (ownerOnly && role !== 'owner') return <Navigate to="/dashboard" replace />;

    // 4. Protect Student Routes (Kick Admins and Owners to their correct dashboards!)
    if (studentOnly) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'owner') return <Navigate to="/owner-dashboard" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    // If they are already logged in and try to visit the login page, redirect them properly!
    if (isAuthenticated()) {
        if (isAdmin()) return <Navigate to="/admin" replace />;
        if (isOwner()) return <Navigate to="/owner-dashboard" replace />; // <-- NEW ROUTING
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<ProtectedRoute studentOnly><StudentDashboard /></ProtectedRoute>} />
                <Route path="/rate/:messId" element={<ProtectedRoute><RatingPage /></ProtectedRoute>} />
                <Route path="/reviews/:messId" element={<ProtectedRoute><ViewReviews /></ProtectedRoute>} />
                <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                {/* NEW: Owner Routes */}
                {/* Notice we pass ownerOnly so the ProtectedRoute checks the right permissions */}
                <Route path="/owner-dashboard" element={<ProtectedRoute ownerOnly><OwnerDashboard messId={1} /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;