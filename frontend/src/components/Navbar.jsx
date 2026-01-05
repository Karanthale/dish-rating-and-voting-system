import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiBarChart2, FiStar } from 'react-icons/fi';
import { clearAuthData, getAuthData, isAdmin } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = getAuthData();

    const handleLogout = () => {
        clearAuthData();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    if (!user) return null;

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to={isAdmin() ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
                        <FiStar className="text-3xl text-primary-600" />
                        <span className="text-2xl font-bold text-primary-700">Rate My Mess</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAdmin() ? (
                            <>
                                <Link
                                    to="/admin"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        isActive('/admin') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <FiBarChart2 />
                                    <span>Dashboard</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        isActive('/dashboard') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <FiHome />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/compare"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        isActive('/compare') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <FiBarChart2 />
                                    <span>Compare</span>
                                </Link>
                            </>
                        )}
                        <Link
                            to="/profile"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                isActive('/profile') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                            }`}
                        >
                            <FiUser />
                            <span>Profile</span>
                        </Link>
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            <FiLogOut />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;