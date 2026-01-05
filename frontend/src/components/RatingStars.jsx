import React from 'react';
import { FiStar } from 'react-icons/fi';

const RatingStars = ({ rating, setRating, readOnly = false }) => {
    return (
        <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && setRating(star)}
                    className={`text-3xl transition-all ${
                        readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    } ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                >
                    <FiStar className={star <= rating ? 'fill-current' : ''} />
                </button>
            ))}
        </div>
    );
};

export default RatingStars;