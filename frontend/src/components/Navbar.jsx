import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State to hold user info
    const [userRole, setUserRole] = useState('student');
    const [userName, setUserName] = useState('User');

    // Fetch user info from localStorage when the Navbar loads
    useEffect(() => {
        const role = localStorage.getItem('userRole') || 'student';
        // If you aren't saving the user's name during login yet, it will just say "User"
        const name = localStorage.getItem('userName') || 'User'; 
        
        setUserRole(role);
        setUserName(name);
    }, []);

    // ==========================================
    // STEP 2: DYNAMIC DASHBOARD LINK LOGIC
    // ==========================================
    const dashboardLink = userRole === 'admin' 
        ? '/admin' 
        : userRole === 'owner' 
            ? '/owner-dashboard' 
            : '/dashboard';

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName'); // If you saved it
        
        // Redirect to login page
        navigate('/auth');
    };

    // Helper function to highlight the active tab
    const isActive = (path) => {
        return location.pathname === path 
            ? "text-green-600 bg-green-50 px-3 py-2 rounded-lg font-medium" 
            : "text-gray-600 hover:text-green-600 px-3 py-2 rounded-lg font-medium transition-colors";
    };

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to={dashboardLink} className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-xl font-bold text-green-700">Rasoi Talk</span>
                        </Link>
                    </div>

                    {/* Middle: Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* THE DYNAMIC LINK IN ACTION */}
                        <Link to={dashboardLink} className={`flex items-center ${isActive(dashboardLink)}`}>
                            <span className="mr-1">🏠</span> Dashboard
                        </Link>
                        
                        <Link to="/compare" className={`flex items-center ${isActive('/compare')}`}>
                            <span className="mr-1">📊</span> Compare
                        </Link>
                        
                        <Link to="/profile" className={`flex items-center ${isActive('/profile')}`}>
                            <span className="mr-1">👤</span> Profile
                        </Link>
                    </div>

                    {/* Right: User Info & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800">{userName}</div>
                            <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;