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

// Protected Route Components
const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        return <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />;
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
                <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                <Route path="/rate/:messId" element={<ProtectedRoute><RatingPage /></ProtectedRoute>} />
                <Route path="/reviews/:messId" element={<ProtectedRoute><ViewReviews /></ProtectedRoute>} />
                <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;