import React, { useState } from 'react';
import API from '../utils/api'; 

const DishRatingWidget = ({ menuId, disabled }) => {
    // State is now scoped to just this ONE specific dish
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'

    const handleSubmit = async () => {
        if (rating === 0) {
            return alert("Please select a star rating first!");
        }

        try {
            // Your exact API endpoint!
            const response = await API.post('/rate/dish', {
                menuId: menuId,
                ratingValue: rating,
                reviewText: review
            });

            // Gamification Success Message
            const successMessage = response.message || (response.data && response.data.message) || "Review submitted!";
            alert(`🎉 ${successMessage}`);
            
            setStatus('success'); // Marks this specific dish as rated

        } catch (error) {
            console.error("Rating Error:", error);
            
            // Your excellent duplicate check logic
            const isDuplicate = 
                (error.response && error.response.status === 400) || 
                (error.message && error.message.includes("400")) ||
                (error.response && error.response.data && error.response.data.message.includes("already rated"));

            if (isDuplicate) {
                alert("You have already rated this dish today!");
                setStatus('success'); // Lock the UI since it's already done
            } else {
                const actualError = (error.response && error.response.data && error.response.data.message) || "Failed to submit rating.";
                alert(`Error: ${actualError}`);
            }
        }
    };

    // 1. Check if the meal is time-locked
    if (disabled) {
        return (
            <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-500 text-sm font-medium border border-gray-200 mt-2">
                🔒 Rating is currently locked
            </div>
        );
    }

    // 2. Check if the student successfully rated the dish
    if (status === 'success') {
        return (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex justify-between items-center mt-2 shadow-inner">
                <span className="font-semibold text-green-800">✅ Rated Successfully</span>
                <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-800 rounded">+10 Points</span>
            </div>
        );
    }

    // 3. Render the interactive form
    return (
        <div className="mt-3">
            {/* Interactive Star Rating */}
            <div className="flex space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="text-2xl focus:outline-none transition-transform hover:scale-110"
                    >
                        <span className={star <= (hover || rating) ? "text-yellow-400 drop-shadow-sm" : "text-gray-200"}>
                            ★
                        </span>
                    </button>
                ))}
            </div>

            {/* Optional Text Review */}
            <textarea
                placeholder="What did you think of this dish? (Optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none bg-gray-50 hover:bg-white transition-colors"
                rows="2"
            ></textarea>

            <button 
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg shadow hover:shadow-md transition-all"
            >
                Submit Rating
            </button>
        </div>
    );
};

export default DishRatingWidget;