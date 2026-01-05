import React from 'react';
import { FiHeart } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <p className="text-gray-600 text-sm flex items-center space-x-1">
                        <span>Made with</span>
                        <FiHeart className="text-red-500" />
                        <span>for better mess food</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-2 md:mt-0">
                        &copy; {new Date().getFullYear()} Rate My Mess. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;