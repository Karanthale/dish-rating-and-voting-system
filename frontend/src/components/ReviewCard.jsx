import React from 'react';
import { FiStar, FiTrash2, FiUser } from 'react-icons/fi';
import { getAuthData } from '../utils/auth';

const ReviewCard = ({ review, onDelete }) => {
    const { user } = getAuthData();
    const isOwner = user?.user_id === review.user_id;

    return (
        <div className="card">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-3 rounded-full">
                        <FiUser className="text-primary-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">{review.user_name}</h4>
                        <p className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                        <FiStar className="text-yellow-500 fill-current" />
                        <span className="font-semibold text-yellow-700">{review.rating_value}</span>
                    </div>
                    {isOwner && onDelete && (
                        <button
                            onClick={() => onDelete(review.rating_id)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <FiTrash2 />
                        </button>
                    )}
                </div>
            </div>

            {review.feedback && (
                <p className="text-gray-700 mt-3 pl-14">{review.feedback}</p>
            )}
        </div>
    );
};

export default ReviewCard;