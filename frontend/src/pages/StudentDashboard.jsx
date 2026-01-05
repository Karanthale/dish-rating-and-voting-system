import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessCard from '../components/MessCard';
import API from '../utils/api';
import { FiSearch } from 'react-icons/fi';

const StudentDashboard = () => {
    const [messes, setMesses] = useState([]);
    const [filteredMesses, setFilteredMesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMesses();
    }, []);

    useEffect(() => {
        const filtered = messes.filter(mess =>
            mess.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mess.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMesses(filtered);
    }, [searchTerm, messes]);

    const fetchMesses = async () => {
        try {
            const response = await API.get('/mess');
            if (response.success) {
                setMesses(response.data);
                setFilteredMesses(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Messes</h1>
                    <p className="text-gray-600">Rate and review your college mess food</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12"
                        />
                    </div>
                </div>

                {/* Messes Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="spinner"></div>
                    </div>
                ) : filteredMesses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No messes found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMesses.map((mess) => (
                            <MessCard key={mess.mess_id} mess={mess} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default StudentDashboard;