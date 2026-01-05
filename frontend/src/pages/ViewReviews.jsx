import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewCard from '../components/ReviewCard';
import API from '../utils/api';
import { FiFilter } from 'react-icons/fi';

const ViewReviews = () => {
    const { messId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [mess, setMess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('date');
    const [order, setOrder] = useState('DESC');

    useEffect(() => {
        fetchMessDetails();
        fetchReviews();
    }, [messId, sortBy, order]);

    const fetchMessDetails = async () => {
        try {
            const response = await API.get(`/mess/${messId}`);
            if (response.success) {
                setMess(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch mess:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await API.get(`/rate/mess/${messId}?sort=${sortBy}&order=${order}`);
            if (response.success) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (ratingId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await API.delete(`/rate/${ratingId}`);
            if (response.success) {
                setReviews(reviews.filter(r => r.rating_id !== ratingId));
            }
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary mb-6"
                >
                    ← Back
                </button>

                {mess && (
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{mess.name}</h1>
                        <p className="text-gray-600">{mess.location}</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <span className="text-3xl font-bold text-primary-600">
                                {parseFloat(mess.avg_rating).toFixed(1)}
                            </span>
                            <span className="text-gray-600">
                                ({mess.total_ratings} {mess.total_ratings === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex items-center space-x-4">
                    <FiFilter className="text-gray-500" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field max-w-xs"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="rating_value">Sort by Rating</option>
                    </select>
                    <select
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="input-field max-w-xs"
                    >
                        <option value="DESC">Descending</option>
                        <option value="ASC">Ascending</option>
                    </select>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="spinner"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No reviews yet. Be the first to rate!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.rating_id}
                                review={review}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ViewReviews;