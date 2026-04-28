import React, { useState } from 'react';
import API from '../utils/api'; 

const CreatePollForm = ({ messId }) => {
    const [question, setQuestion] = useState("What should be tomorrow's special?");
    const [options, setOptions] = useState(["", ""]); // Start with 2 empty options
    const [expiresDays, setExpiresDays] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle changing a specific option's text
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // Add a new empty option box
    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    // Remove a specific option box
    const handleRemoveOption = (index) => {
        if (options.length <= 2) {
            return alert("A poll must have at least 2 options.");
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    // Submit the poll to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        const filledOptions = options.filter(opt => opt.trim() !== "");
        if (!question.trim()) return alert("Please enter a question.");
        if (filledOptions.length < 2) return alert("Please provide at least 2 valid dish options.");

        setIsSubmitting(true);

        try {
            const response = await API.post('/polls/create', {
                messId,
                question,
                options: filledOptions,
                expiresDays
            });

            alert(`✅ ${response.message || 'Poll created successfully!'}`);
            
            // Reset the form for the next poll
            setQuestion("");
            setOptions(["", ""]);
            
        } catch (error) {
            console.error("Error creating poll:", error);
            const actualError = (error.response && error.response.data && error.response.data.message) || "Failed to create poll.";
            alert(`❌ Error: ${actualError}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-2xl mx-auto my-8">
            <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <span className="text-xl">📊</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Create a New Poll</h2>
                    <p className="text-sm text-gray-500">Ask students what they want to eat</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Question Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Poll Question</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., What should be Sunday's dessert?"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Dynamic Dish Options */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dish Options</label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1} (e.g., Gulab Jamun)`}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {/* Only show remove button if there are more than 2 options */}
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        + Add another option
                    </button>
                </div>

                {/* Expiry Dropdown */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                    <select 
                        value={expiresDays}
                        onChange={(e) => setExpiresDays(parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value={1}>1 Day (Ends Tomorrow)</option>
                        <option value={2}>2 Days</option>
                        <option value={7}>1 Week</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                        isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isSubmitting ? 'Publishing...' : 'Publish Poll'}
                </button>
            </form>
        </div>
    );
};

export default CreatePollForm;