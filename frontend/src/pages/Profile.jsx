import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Ensure ReviewCard is imported if you use it elsewhere, though it's not used in this specific file right now
import ReviewCard from '../components/ReviewCard'; 
import API from '../utils/api';
import { FiUser, FiMail, FiCalendar, FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getAuthData, setAuthData } from '../utils/auth';

const Profile = () => {
    const { user } = getAuthData();
    const [profile, setProfile] = useState(null);
    const [userRatings, setUserRatings] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchUserRatings();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await API.get('/auth/profile');
            if (response.success) {
                setProfile(response.data);
                setName(response.data.name);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRatings = async () => {
        try {
            const response = await API.get('/rate/user');
            if (response.success) {
                setUserRatings(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await API.put('/auth/profile', { name });
            if (response.success) {
                setProfile({ ...profile, name });
                // Update localStorage
                const updatedUser = { ...user, name };
                setAuthData(localStorage.getItem('token'), updatedUser);
                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const handleDeleteRating = async (ratingId) => {
        if (!confirm('Are you sure you want to delete this rating?')) return;

        try {
            const response = await API.delete(`/rate/${ratingId}`);
            if (response.success) {
                setUserRatings(userRatings.filter(r => r.rating_id !== ratingId));
            }
        } catch (error) {
            alert('Failed to delete rating');
        }
    };

    const calculateStats = () => {
        if (userRatings.length === 0) return { avgRating: 0, totalRatings: 0 };
        
        const totalRatings = userRatings.length;
        const avgRating = userRatings.reduce((sum, r) => sum + r.rating_value, 0) / totalRatings;
        
        return { avgRating: avgRating.toFixed(1), totalRatings };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
                Error loading profile data.
            </div>
        );
    }

    // Safely extract gamification data (with fallbacks just in case)
    const gamification = profile.gamification || {
        badge: "Newbie",
        nextBadge: "Food Critic",
        pointsNeeded: 50,
        progressPercentage: 0
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">My Profile</h1>

                {/* ========================================== */}
                {/* GAMIFICATION WIDGET                        */}
                {/* ========================================== */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white mb-8 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1">Current Status</p>
                            <h2 className="text-4xl font-black mb-2">{gamification.badge}</h2>
                            <p className="text-indigo-100 text-sm">
                                You have earned <span className="font-bold text-yellow-300 text-lg">{profile.points || 0}</span> contribution points!
                            </p>
                        </div>
                        
                        {/* Progress Circle / Stats */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 w-full md:w-72 border border-white/20 shadow-inner">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                                <span>Next Rank: <span className="text-yellow-300">{gamification.nextBadge}</span></span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-indigo-900/60 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${gamification.progressPercentage}%` }}
                                ></div>
                            </div>
                            
                            {gamification.pointsNeeded > 0 ? (
                                <p className="text-xs text-indigo-100 text-right font-medium">
                                    {gamification.pointsNeeded} points to go
                                </p>
                            ) : (
                                <p className="text-xs text-yellow-300 font-bold text-right tracking-wide">
                                    MAX RANK ACHIEVED!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="card bg-white shadow-sm border border-gray-200">
                            <div className="flex justify-center mb-6">
                                <div className="bg-primary-50 p-8 rounded-full border-4 border-primary-100">
                                    <FiUser className="text-6xl text-primary-600" />
                                </div>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-field border-gray-300 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button type="submit" className="btn-primary flex-1 py-2">
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setName(profile.name);
                                            }}
                                            className="btn-secondary flex-1 py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                            {profile.name}
                                        </h2>
                                        <span className="inline-block mt-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            {profile.role}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6 border-t border-gray-100 pt-6">
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <FiMail className="text-primary-600" />
                                            </div>
                                            <span className="text-sm font-medium">{profile.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <FiCalendar className="text-primary-600" />
                                            </div>
                                            <span className="text-sm font-medium">
                                                Joined {new Date(profile.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-outline w-full flex items-center justify-center space-x-2 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        <FiEdit2 />
                                        <span>Edit Profile</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Statistics Card */}
                        <div className="card mt-6 bg-white shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">My Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Total Ratings</span>
                                    <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                        {stats.totalRatings}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Average Rating</span>
                                    <span className="text-2xl font-black text-yellow-500 bg-yellow-50 px-3 py-1 rounded-lg flex items-center space-x-1">
                                        <FiStar className="fill-current text-lg" />
                                        <span>{stats.avgRating}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating History */}
                    <div className="lg:col-span-2">
                        <div className="card bg-white shadow-sm border border-gray-200 h-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">My Reviews</h2>
                            
                            {userRatings.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">You haven't rated any mess yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Start reviewing to earn points and level up your badge!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userRatings.map((rating) => (
                                        <div key={rating.rating_id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{rating.mess_name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">{rating.location}</p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm border border-yellow-200">
                                                        <FiStar className="text-yellow-500 fill-current" />
                                                        <span className="font-bold text-yellow-700">
                                                            {rating.rating_value}.0
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteRating(rating.rating_id)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                        title="Delete Review"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                            {rating.feedback && (
                                                <div className="bg-white p-3 rounded-lg border border-gray-100 mt-2">
                                                    <p className="text-gray-700 italic">"{rating.feedback}"</p>
                                                </div>
                                            )}
                                            <p className="text-xs font-semibold text-gray-400 mt-3 flex items-center">
                                                <FiCalendar className="mr-1" />
                                                {new Date(rating.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;