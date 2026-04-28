import React, { useState, useEffect } from 'react';
import API from '../utils/api'; 

const PollWidget = ({ messId }) => {
    // 1. We changed `polls` (array) to `pollData` (single object)
    const [pollData, setPollData] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    // 2. We replaced the complex Set() with a simple boolean flag
    const [hasVoted, setHasVoted] = useState(false); 

    const fetchPoll = async () => {
        try {
            const response = await API.get(`/polls/mess/${messId}`);
            console.log("Poll API Response:", response); 

            if (response.success && response.data) {
                setPollData(response.data);
                
                // NEW: If the database says they already voted, lock the UI!
                if (response.data.hasVoted) {
                    setHasVoted(true);
                }
            } else {
                setPollData(null); // Explicitly handle "no active poll"
            }
        } catch (error) {
            console.error("Error fetching poll:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (messId) {
            fetchPoll();
        }
    }, [messId]);

    const handleVote = async (pollId, optionId) => {
        try {
            const response = await API.post('/polls/vote', { pollId, optionId });
            console.log("Vote Success Response:", response);
            
            const successMessage = response.message || (response.data && response.data.message) || "Vote submitted successfully!";
            alert(`🎉 ${successMessage}`); 
            
            setHasVoted(true); // Lock the UI locally
            fetchPoll(); // Refresh to get the updated percentage bars from the database!
            
       } catch (error) {
            console.error("Detailed Vote Error:", error);
            
            // Grab the real error message from the backend
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";

            // ONLY lock the UI if the backend explicitly says you already voted
            if (errorMessage.toLowerCase().includes("already") || errorMessage.toLowerCase().includes("voted")) {
                alert("You have already voted on this poll!");
                setHasVoted(true);
            } else {
                // Show the REAL error so we know what is actually breaking!
                alert(`Backend Error: ${errorMessage}`);
            }
        }
    };

    if (loading) return <div className="animate-pulse h-24 bg-gray-200 rounded-lg"></div>;
    
    // 3. Hide widget if there is no active poll data
    if (!pollData) return null; 

    // 4. We removed the outer polls.map() loop entirely!
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">📊 {pollData.question}</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {pollData.total_votes || 0} Votes
                </span>
            </div>

            <div className="space-y-3">
                {pollData.options && pollData.options.map((option) => (
                    <div key={option.option_id} className="relative">
                        <button
                            onClick={() => handleVote(pollData.poll_id, option.option_id)}
                            disabled={hasVoted}
                            className={`w-full relative overflow-hidden text-left px-4 py-3 rounded-lg transition-all duration-200 border 
                                ${hasVoted 
                                    ? 'border-gray-200 bg-gray-50 cursor-default' 
                                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                }`}
                        >
                            {/* Progress Bar Background */}
                            {hasVoted && (
                                <div 
                                    className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-500 ease-out"
                                    style={{ width: `${option.percentage || 0}%` }}
                                ></div>
                            )}

                            {/* Text and Percentage overlay */}
                            <div className="relative z-10 flex justify-between items-center">
                                <span className={`font-medium ${hasVoted ? 'text-gray-700' : 'text-gray-800'}`}>
                                    {option.dish_name}
                                </span>
                                {hasVoted && (
                                    <span className="font-bold text-blue-700">
                                        {option.percentage || 0}%
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PollWidget;