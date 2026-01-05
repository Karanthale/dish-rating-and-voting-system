import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RatingStars from '../components/RatingStars';
import API from '../utils/api';

const RatingPage = () => {
    const { messId } = useParams();
    const navigate = useNavigate();
    const [mess, setMess] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMessDetails();
        fetchUserRating();
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

    const handleSubmit = async (e) => {
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
                setSuccess('Rating submitted successfully!');
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    if (!mess) {
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
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary mb-6"
                    >
                        ← Back
                    </button>

                    <div className="card">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{mess.name}</h1>
                        <p className="text-gray-600 mb-6">{mess.location}</p>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3">
                                    Your Rating
                                </label>
                                <RatingStars rating={rating} setRating={setRating} />
                            </div>

                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="input-field min-h-[120px] resize-none"
                                    placeholder="Share your experience..."
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {feedback.length}/500 characters
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="btn-primary w-full py-3"
                            >
                                {loading ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RatingPage;