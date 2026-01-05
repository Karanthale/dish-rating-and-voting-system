import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiUsers, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <FiStar className="text-6xl text-primary-600" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Rate My Mess - Your Voice , Our Taste
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Help improve your college dining experience. Rate, review, and compare mess.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => navigate('/auth?mode=login')}
                            className="btn-primary text-lg px-8 py-3"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/auth?mode=signup')}
                            className="btn-outline text-lg px-8 py-3"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="text-center p-6">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUsers className="text-3xl text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Student Reviews</h3>
                        <p className="text-gray-600">
                            Read authentic reviews from fellow students about mess food quality and service.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTrendingUp className="text-3xl text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Compare Messes</h3>
                        <p className="text-gray-600">
                            Compare ratings and reviews across multiple messes to make informed decisions.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="text-3xl text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time Analytics</h3>
                        <p className="text-gray-600">
                            Admins can view insights and analytics to continuously improve food quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-20">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    <p>&copy; 2025 Rate My Mess. Making college dining better.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;