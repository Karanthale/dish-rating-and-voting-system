import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';

const MessCard = ({ mess }) => {
    const navigate = useNavigate();

    return (
        <div className="card animate-fade-in hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800">{mess.name}</h3>
                <div className="flex items-center space-x-1 bg-primary-100 px-3 py-1 rounded-full">
                    <FiStar className="text-primary-600 fill-current" />
                    <span className="font-semibold text-primary-700">
                        {parseFloat(mess.avg_rating || 0).toFixed(1)}
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <FiMapPin className="text-primary-500" />
                <span className="text-sm">{mess.location}</span>
            </div>

            <p className="text-gray-600 text-sm mb-4">
                {mess.description || 'No description available'}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{mess.total_ratings || 0} ratings</span>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={() => navigate(`/rate/${mess.mess_id}`)}
                    className="btn-primary flex-1"
                >
                    Rate Now
                </button>
                <button
                    onClick={() => navigate(`/reviews/${mess.mess_id}`)}
                    className="btn-outline flex-1"
                >
                    View Reviews
                </button>
            </div>
        </div>
    );
};

export default MessCard;