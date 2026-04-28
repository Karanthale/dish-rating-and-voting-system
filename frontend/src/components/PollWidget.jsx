import React, { useState, useEffect } from 'react';
import API from '../utils/api'; 

// NEW: Added readOnly prop (defaults to false so it doesn't break the student view)
const PollWidget = ({ messId, readOnly = false }) => {
    const [pollData, setPollData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [hasVoted, setHasVoted] = useState(false); 

    const fetchPoll = async () => {
        try {
            const response = await API.get(`/polls/mess/${messId}`);
            console.log("Poll API Response:", response); 

            if (response.success && response.data) {
                setPollData(response.data);
                
                if (response.data.hasVoted) {
                    setHasVoted(true);
                }
            } else {
                setPollData(null); 
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
        // Prevent voting if in read-only mode
        if (readOnly) return; 

        try {
            const response = await API.post('/polls/vote', { pollId, optionId });
            console.log("Vote Success Response:", response);
            
            const successMessage = response.message || (response.data && response.data.message) || "Vote submitted successfully!";
            alert(`🎉 ${successMessage}`); 
            
            setHasVoted(true); 
            fetchPoll(); 
            
       } catch (error) {
            console.error("Detailed Vote Error:", error);
            
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";

            if (errorMessage.toLowerCase().includes("already") || errorMessage.toLowerCase().includes("voted")) {
                alert("You have already voted on this poll!");
                setHasVoted(true);
            } else {
                alert(`Backend Error: ${errorMessage}`);
            }
        }
    };

    if (loading) return <div className="animate-pulse h-24 bg-gray-200 rounded-lg"></div>;
    if (!pollData) return null; 

    // NEW: Determine if we should reveal the results.
    // Show them if the user has voted OR if the widget is in read-only mode (Owner Dashboard)
    const showResults = hasVoted || readOnly;

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
                            // Disable the button if results are showing
                            disabled={showResults} 
                            className={`w-full relative overflow-hidden text-left px-4 py-3 rounded-lg transition-all duration-200 border 
                                ${showResults 
                                    ? 'border-gray-200 bg-gray-50 cursor-default' 
                                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                }`}
                        >
                            {/* Progress Bar Background */}
                            {showResults && (
                                <div 
                                    className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-500 ease-out"
                                    style={{ width: `${option.percentage || 0}%` }}
                                ></div>
                            )}

                            {/* Text and Percentage overlay */}
                            <div className="relative z-10 flex justify-between items-center">
                                <span className={`font-medium ${showResults ? 'text-gray-700' : 'text-gray-800'}`}>
                                    {option.dish_name}
                                </span>
                                {showResults && (
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