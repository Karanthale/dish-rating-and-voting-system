import React, { useState, useEffect } from 'react';
import API from '../utils/api'; 
import CreatePollForm from "../components/CreatePollForm";
import PollWidget from "../components/PollWidget";
import Navbar from '../components/Navbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuthData } from '../utils/auth';

const OwnerDashboard = () => {
    // Get the real mess ID and Name from the logged-in owner
    const { user } = getAuthData();
    const messId = user?.mess_id || user?.messId;
    const messName = user?.mess_name || 'Contractor';

    // Existing State
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Menu Form & Data State
    const [dishName, setDishName] = useState('');
    const [mealType, setMealType] = useState('Lunch');
    const [dietaryTag, setDietaryTag] = useState('Veg');
    const [menuMessage, setMenuMessage] = useState('');
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        fetchAnalytics();
        fetchTodayMenu();
    }, [messId]);

    const fetchAnalytics = async () => {
        try {
            const response = await API.get(`/analytics/owner/${messId}`);
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

   const fetchTodayMenu = async () => {
        try {
            const response = await API.get(`/menu/${messId}`);
            
            // 1. Let's print the ENTIRE response to see exactly what the backend sent!
            console.log("FULL MENU RESPONSE:", response); 

            // 2. Grab the data no matter what the backend named it
            const actualData = response.data || response.menu || response.items || (Array.isArray(response) ? response : null);

            if (actualData) {
                let flattenedMenu = [];

                const findDishes = (data) => {
                    if (!data) return;
                    if (Array.isArray(data)) {
                        data.forEach(findDishes);
                    } else if (typeof data === 'object' && data.dish_name) {
                        flattenedMenu.push(data);
                    } else if (typeof data === 'object') {
                        Object.values(data).forEach(findDishes);
                    }
                };

                findDishes(actualData);
                setMenu(flattenedMenu);
            } else {
                setMenu([]);
            }
        } catch (error) {
            console.error("Error fetching menu:", error);
            setMenu([]);
        }
    };

    const handleAddDish = async (e) => {
        e.preventDefault();
        
        // Safety Check: If the ID is completely missing from storage, stop and warn you!
        if (!messId) {
            alert("Error: Mess ID is missing from your profile. Please Log Out and Log In again.");
            return;
        }

        try {
            // We are explicitly sending BOTH spellings to the backend to guarantee it catches it!
            const response = await API.post('/menu/add', { 
                mess_id: messId,   // For backend controllers expecting snake_case
                messId: messId,    // For backend controllers expecting camelCase
                dishName: dishName, 
                mealType: mealType, 
                dietaryTag: dietaryTag 
            });

            if (response.success) {
                setMenuMessage(response.message || "Dish added successfully!");
                setDishName(''); 
                fetchTodayMenu(); 
                setTimeout(() => setMenuMessage(''), 3000); 
            }
        } catch (error) {
            console.error("Error adding dish:", error);
            setMenuMessage("Failed to add dish. Check console.");
        }
    };

    const handleToggleStock = async (menuId, currentStatus) => {
        try {
            const newStatus = !currentStatus; 
            const response = await API.patch(`/menu/stock/${menuId}`, {
                is_out_of_stock: newStatus
            });

            if (response.success) {
                setMenu(prevMenu => 
                    prevMenu.map(dish => 
                        dish.menu_id === menuId ? { ...dish, is_out_of_stock: newStatus } : dish
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Failed to update stock status.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-500">Loading your analytics...</div>;
    }

    if (!analytics) {
        return <div className="text-center text-red-500 mt-10">Failed to load analytics data.</div>;
    }
    const { overview, topDishes, engagement } = analytics;

    // MOCK DATA FOR THE CHART (Fallback if backend doesn't send monthly data yet)
    const trendData = analytics.monthlyTrends || [
        { month: 'Nov', rating: 3.8, reviews: 120 },
        { month: 'Dec', rating: 4.0, reviews: 150 },
        { month: 'Jan', rating: 3.9, reviews: 180 },
        { month: 'Feb', rating: 4.2, reviews: 210 },
        { month: 'Mar', rating: 4.5, reviews: 250 },
        { month: 'Apr', rating: 4.7, reviews: 310 },
    ];

    // Custom Tooltip for the Recharts graph
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2">{label} Performance</p>
                    <p className="text-sm text-green-600 font-semibold">
                        Average Rating: {payload[0].value} ★
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">
                        Total Reviews: {payload[1].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8">
                
                {/* Dashboard Header */}
                <div className="flex justify-between items-end border-b pb-4">
                    <div>
                        {/* DYNAMIC TITLE APPLIED HERE */}
                        <h1 className="text-3xl font-bold text-gray-800">{messName} Dashboard</h1>
                        <p className="text-gray-500">Real-time performance and AI insights</p>
                    </div>
                    <button onClick={() => { fetchAnalytics(); fetchTodayMenu(); }} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
                        🔄 Refresh Data
                    </button>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Reviews</p>
                        <p className="text-3xl font-bold text-gray-800">{overview.total_reviews || 0}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Average Rating</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {Number(overview.avg_rating).toFixed(1)} <span className="text-lg text-yellow-400">★</span>
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                        <p className="text-sm font-semibold text-gray-500 mb-1">AI Sentiment: Positive</p>
                        <p className="text-3xl font-bold text-green-600">{overview.positive_count || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                        <p className="text-sm font-semibold text-gray-500 mb-1">AI Sentiment: Negative</p>
                        <p className="text-3xl font-bold text-red-600">{overview.negative_count || 0}</p>
                    </div>
                </div>

                {/* RECHARTS MONTHLY TREND GRAPH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-2">📈</span> 6-Month Performance Trend
                    </h2>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#9CA3AF" tick={{fill: '#6B7280'}} />
                                <YAxis yAxisId="left" stroke="#9CA3AF" tick={{fill: '#6B7280'}} domain={[0, 5]} />
                                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{fill: '#6B7280'}} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <Tooltip content={<CustomTooltip />} />
                                
                                {/* The Data Lines */}
                                <Area yAxisId="left" type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" activeDot={{ r: 8 }} />
                                <Area yAxisId="right" type="monotone" dataKey="reviews" stroke="#3B82F6" strokeWidth={2} fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Top Dishes & Today's Active Menu */}
                    <div className="space-y-6">
                        
                        {/* Top Rated Dishes Table */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">🏆</span> Top Rated Dishes
                            </h2>
                            
                            {topDishes?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b text-gray-500 text-sm">
                                                <th className="pb-3 font-semibold">Dish Name</th>
                                                <th className="pb-3 font-semibold text-center">Rating</th>
                                                <th className="pb-3 font-semibold text-center">AI Mood</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topDishes.map((dish, index) => (
                                                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="py-4 font-medium text-gray-800">{dish.dish_name}</td>
                                                    <td className="py-4 text-center font-bold">
                                                        {Number(dish.avg_rating).toFixed(1)} <span className="text-yellow-400">★</span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        {dish.positive_reviews > dish.negative_reviews 
                                                            ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Good</span>
                                                            : dish.negative_reviews > 0 
                                                                ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Needs Work</span>
                                                                : <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">Neutral</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-center py-6">No dish ratings yet. Add some items to the menu!</p>
                            )}
                        </div>

                        {/* Today's Active Menu Management */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">📋</span> Manage Today's Menu
                            </h2>
                            
                            {menu?.length > 0 ? (
                                <div className="space-y-2">
                                    {menu.map((dish) => (
                                        <div key={dish.menu_id} className="flex justify-between items-center p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                            <div>
                                                <span className={`font-semibold ${dish.is_out_of_stock ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                    {dish.dish_name}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {dish.meal_type}
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleToggleStock(dish.menu_id, dish.is_out_of_stock)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                                                    dish.is_out_of_stock
                                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                }`}
                                            >
                                                {dish.is_out_of_stock ? '🔴 Out of Stock' : '🟢 In Stock'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-center py-6">No active dishes on the menu today.</p>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <span className="mr-2">📊</span> Live Poll Results
                            </h3>
                            {/* This is the same widget the students see! */}
                            <PollWidget messId={messId} readOnly={true} /> 
                        </div>

                    </div>

                    {/* Right Column: Polls & Form Section */}
                    <div className="space-y-6">
                        
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Student Engagement</h3>
                                <p className="text-blue-100 text-sm">Total votes cast across all your polls</p>
                            </div>
                            <div className="text-4xl font-black bg-white/20 px-4 py-2 rounded-lg">
                                {engagement.totalPollVotes}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <span className="mr-2">🍲</span> Add to Today's Menu
                            </h3>
                            
                            {menuMessage && (
                                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${menuMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {menuMessage}
                                </div>
                            )}

                            <form onSubmit={handleAddDish} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dish Name</label>
                                    <input 
                                        type="text" 
                                        value={dishName}
                                        onChange={(e) => setDishName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="e.g., Paneer Butter Masala"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Meal Category</label>
                                    <select 
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="Breakfast">Breakfast</option>
                                        <option value="Lunch">Lunch</option>
                                        <option value="Dinner">Dinner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dietary Tag</label>
                                    <select 
                                        value={dietaryTag}
                                        onChange={(e) => setDietaryTag(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="Veg">🟢 Veg</option>
                                        <option value="Non-Veg">🔴 Non-Veg</option>
                                        <option value="Egg">🟡 Egg</option>
                                        <option value="Jain">🟠 Jain</option>
                                        <option value="Vegan">🌱 Vegan</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                                    + Add Dish to Menu
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <CreatePollForm messId={messId} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OwnerDashboard;