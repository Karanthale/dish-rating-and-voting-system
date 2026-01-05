import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewCard from '../components/ReviewCard';
import API from '../utils/api';
import { FiUser, FiMail, FiCalendar, FiStar, FiEdit2 } from 'react-icons/fi';
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

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <div className="flex justify-center mb-6">
                                <div className="bg-primary-100 p-8 rounded-full">
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
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button type="submit" className="btn-primary flex-1">
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setName(profile.name);
                                            }}
                                            className="btn-secondary flex-1"
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
                                        <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <FiMail className="text-primary-600" />
                                            <span className="text-sm">{profile.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <FiCalendar className="text-primary-600" />
                                            <span className="text-sm">
                                                Joined {new Date(profile.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-outline w-full flex items-center justify-center space-x-2"
                                    >
                                        <FiEdit2 />
                                        <span>Edit Profile</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Statistics Card */}
                        <div className="card mt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">My Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Ratings</span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        {stats.totalRatings}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Average Rating</span>
                                    <span className="text-2xl font-bold text-primary-600 flex items-center space-x-1">
                                        <FiStar className="fill-current" />
                                        <span>{stats.avgRating}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating History */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Reviews</h2>
                            
                            {userRatings.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">You haven't rated any mess yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userRatings.map((rating) => (
                                        <div key={rating.rating_id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{rating.mess_name}</h3>
                                                    <p className="text-sm text-gray-500">{rating.location}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center space-x-1">
                                                        <FiStar className="text-yellow-500 fill-current" />
                                                        <span className="font-semibold text-yellow-700">
                                                            {rating.rating_value}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteRating(rating.rating_id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            {rating.feedback && (
                                                <p className="text-gray-700 mt-2">{rating.feedback}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
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