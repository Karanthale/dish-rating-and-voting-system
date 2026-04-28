import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RatingStars from '../components/RatingStars';
import API from '../utils/api';
// IMPORT THE NEW WIDGETS
import PollWidget from '../components/PollWidget'; 
import DishRatingWidget from '../components/DishRatingWidget'; 

const RatingPage = () => {
    const { messId } = useParams();
    const navigate = useNavigate();
    
    // Existing State
    const [mess, setMess] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // NEW State for Time-Locked Menu & Filtering
    const [menuArray, setMenuArray] = useState([]); // We now store the raw array from the backend
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // FEATURE 2: Dietary Filter State
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchMessDetails();
        fetchUserRating();
        fetchDailyMenu(); 

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [messId]);

    const fetchMessDetails = async () => {
        try {
            const response = await API.get(`/mess/${messId}`); 
            if (response.success) {
                setMess(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch mess details:', error);
        }
    };

    const fetchUserRating = async () => {
        try {
            const response = await API.get('/rate/user');
            if (response.success) {
                const existingRating = response.data.find(r => r.mess_id == messId);
                if (existingRating) {
                    setRating(existingRating.rating_value);
                    setFeedback(existingRating.feedback || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch user rating:', error);
        }
    };

    const fetchDailyMenu = async () => {
        try {
            const response = await API.get(`/menu/${messId}`);
            if (response.success) {
                let items = [];
                
                // Case 1: Backend sends a flat array directly
                if (Array.isArray(response.data)) {
                    items = response.data;
                } 
                // Case 2: Backend sends a categorized object { Breakfast: [], Lunch: [] }
                else if (response.menu && typeof response.menu === 'object' && !Array.isArray(response.menu)) {
                    // .flat() combines all the separate meal arrays into one big array!
                    items = Object.values(response.menu).flat();
                } 
                // Case 3: Backend sends a flat array inside response.menu
                else if (Array.isArray(response.menu)) {
                    items = response.menu;
                }

                setMenuArray(items); 
            }
        } catch (error) {
            console.error('Failed to fetch daily menu:', error);
            setMenuArray([]); // Fallback to empty array on error
        }
    };

    const handleOverallSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await API.post('/rate', {
                mess_id: parseInt(messId),
                rating_value: rating,
                feedback: feedback.trim()
            });

            if (response.success) {
                setSuccess('Overall Rating submitted successfully!');
            }
        } catch (err) {
            setError(err.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    const isMealActive = (mealType) => {
        if (!mess) return false;

        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        const parseTime = (timeString) => {
            if (!timeString) return 0;
            const [hours, minutes] = timeString.split(':').map(Number);
            return hours * 60 + minutes;
        };

        let startStr, endStr;
        if (mealType === 'Breakfast') {
            startStr = mess.breakfast_start || "07:00:00";
            endStr = mess.breakfast_end || "11:30:00";
        } else if (mealType === 'Lunch') {
            startStr = mess.lunch_start || "12:00:00";
            endStr = mess.lunch_end || "15:00:00";
        } else if (mealType === 'Dinner') {
            startStr = mess.dinner_start || "19:00:00";
            endStr = mess.dinner_end || "10:45:00";
        }

        const startMinutes = parseTime(startStr);
        const endMinutes = parseTime(endStr);

        return currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes;
    };

    if (!mess) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    // ==========================================
    // DIETARY FILTERING LOGIC
    // ==========================================

    // 0. Bulletproof check to ensure menuArray is ALWAYS an array
    const safeMenuArray = Array.isArray(menuArray) ? menuArray : [];

    // 1. Filter the entire menu array based on the active button
    const filteredMenu = menuArray.filter(dish => 
        activeFilter === 'All' || dish.dietary_tag === activeFilter
    );

    // 2. Re-categorize the newly filtered array into Breakfast/Lunch/Dinner
    const menu = {
        Breakfast: filteredMenu.filter(item => item.meal_type === 'Breakfast'),
        Lunch: filteredMenu.filter(item => item.meal_type === 'Lunch'),
        Dinner: filteredMenu.filter(item => item.meal_type === 'Dinner')
    };

    // Helper function to color code the dietary tags in the UI
    const getDietaryColor = (tag) => {
        switch(tag) {
            case 'Veg': return 'bg-green-100 text-green-700';
            case 'Non-Veg': return 'bg-red-100 text-red-700';
            case 'Egg': return 'bg-yellow-100 text-yellow-700';
            case 'Vegan': return 'bg-emerald-100 text-emerald-700';
            case 'Jain': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate(-1)} className="btn-secondary mb-6">
                        ← Back
                    </button>

                    <div className="card mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{mess.name}</h1>
                        <p className="text-gray-600 mb-6">{mess.location}</p>

                        <div className="mb-8">
                            <PollWidget messId={messId} />
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold mb-4">Overall Experience</h2>
                            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
                            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>}

                            <form onSubmit={handleOverallSubmit} className="space-y-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Overall Rating</label>
                                    <RatingStars rating={rating} setRating={setRating} />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Feedback (Optional)</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="input-field min-h-[100px] resize-none"
                                        placeholder="Share your overall experience..."
                                        maxLength={500}
                                    />
                                </div>
                                <button type="submit" disabled={loading || rating === 0} className="btn-primary w-full py-3">
                                    {loading ? 'Submitting...' : 'Submit Overall Rating'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mb-6 border-b-2 border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Rate Today's Menu
                        </h2>

                        {/* THE DIETARY FILTER BUTTONS                 */}
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Veg', 'Non-Veg', 'Egg', 'Jain', 'Vegan'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveFilter(tag)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all shadow-sm ${
                                        activeFilter === tag 
                                            ? 'bg-blue-600 text-white border-blue-600 scale-105' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                        const active = isMealActive(mealType);
                        const items = menu[mealType] || [];

                        return (
                            <div key={mealType} className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">{mealType}</h3>
                                    
                                    {!active ? (
                                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                                            🔒 Currently Locked
                                        </span>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center animate-pulse">
                                            🟢 Rating Open Now
                                        </span>
                                    )}
                                </div>

                                {items.length === 0 ? (
                                    <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">
                                        {activeFilter === 'All' 
                                            ? `No items listed for ${mealType} today.` 
                                            : `No ${activeFilter} items listed for ${mealType} today.`}
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((dish) => (
                                            <div 
                                                key={dish.menu_id} 
                                                className={`p-4 border rounded-lg transition-all ${
                                                    active 
                                                        ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md' 
                                                        : 'bg-gray-50 border-gray-100 opacity-60 pointer-events-none'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-semibold text-lg text-gray-800">{dish.dish_name}</h4>
                                                        
                                                        {/* Visual Dietary Tag */}
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getDietaryColor(dish.dietary_tag || 'Veg')}`}>
                                                            {dish.dietary_tag || 'Veg'}
                                                        </span>
                                                    </div>
                                                    
                                                    {dish.is_out_of_stock === 1 && (
                                                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded shadow-sm">Sold Out</span>
                                                    )}
                                                </div>
                                                
                                                <DishRatingWidget 
                                                    menuId={dish.menu_id} 
                                                    disabled={!active || dish.is_out_of_stock === 1} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RatingPage;