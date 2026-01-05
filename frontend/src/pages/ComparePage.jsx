import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const ComparePage = () => {
    const navigate = useNavigate();
    const [messes, setMesses] = useState([]);
    const [selectedMesses, setSelectedMesses] = useState([]);
    const [comparisonData, setComparisonData] = useState(null);
    const [chartType, setChartType] = useState('bar');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMesses();
    }, []);

    const fetchMesses = async () => {
        try {
            const response = await API.get('/mess');
            if (response.success) {
                setMesses(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messes:', error);
        }
    };

    const toggleMessSelection = (messId) => {
        if (selectedMesses.includes(messId)) {
            setSelectedMesses(selectedMesses.filter(id => id !== messId));
        } else {
            if (selectedMesses.length >= 5) {
                alert('You can compare up to 5 messes at a time');
                return;
            }
            setSelectedMesses([...selectedMesses, messId]);
        }
    };

    const handleCompare = async () => {
        if (selectedMesses.length < 2) {
            alert('Please select at least 2 messes to compare');
            return;
        }

        setLoading(true);
        try {
            const response = await API.get(`/rate/compare?messIds=${selectedMesses.join(',')}`);
            if (response.success) {
                setComparisonData(response.data);
            }
        } catch (error) {
            console.error('Comparison failed:', error);
            alert('Failed to compare messes');
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!comparisonData) return null;

        const labels = comparisonData.map(m => m.name);
        const avgRatings = comparisonData.map(m => parseFloat(m.avg_rating));

        if (chartType === 'bar') {
            return {
                labels,
                datasets: [
                    {
                        label: 'Average Rating',
                        data: avgRatings,
                        backgroundColor: 'rgba(20, 184, 166, 0.6)',
                        borderColor: 'rgba(20, 184, 166, 1)',
                        borderWidth: 2,
                    }
                ]
            };
        } else {
            return {
                labels,
                datasets: [
                    {
                        label: 'Average Rating',
                        data: avgRatings,
                        backgroundColor: 'rgba(20, 184, 166, 0.2)',
                        borderColor: 'rgba(20, 184, 166, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(20, 184, 166, 1)',
                    }
                ]
            };
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Mess Comparison',
                font: {
                    size: 18,
                    weight: 'bold'
                }
            },
        },
        scales: chartType === 'bar' ? {
            y: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    stepSize: 1
                }
            }
        } : {
            r: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Compare Messes</h1>
                    <p className="text-gray-600">Select messes to compare ratings and reviews</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Selection Panel */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Select Messes ({selectedMesses.length}/5)
                            </h2>
                            
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {messes.map((mess) => (
                                    <button
                                        key={mess.mess_id}
                                        onClick={() => toggleMessSelection(mess.mess_id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                            selectedMesses.includes(mess.mess_id)
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">{mess.name}</p>
                                            <p className="text-xs text-gray-500">{mess.location}</p>
                                        </div>
                                        {selectedMesses.includes(mess.mess_id) ? (
                                            <FiCheckSquare className="text-primary-600 text-xl" />
                                        ) : (
                                            <FiSquare className="text-gray-400 text-xl" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleCompare}
                                disabled={selectedMesses.length < 2 || loading}
                                className="btn-primary w-full mt-4"
                            >
                                {loading ? 'Comparing...' : 'Compare Selected'}
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {comparisonData ? (
                            <div className="space-y-6">
                                {/* Chart Type Toggle */}
                                <div className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">Visual Comparison</h2>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setChartType('bar')}
                                                className={`px-4 py-2 rounded-lg ${
                                                    chartType === 'bar' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                                                }`}
                                            >
                                                Bar Chart
                                            </button>
                                            <button
                                                onClick={() => setChartType('radar')}
                                                className={`px-4 py-2 rounded-lg ${
                                                    chartType === 'radar' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                                                }`}
                                            >
                                                Radar Chart
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-96">
                                        {chartType === 'bar' ? (
                                            <Bar data={getChartData()} options={chartOptions} />
                                        ) : (
                                            <Radar data={getChartData()} options={chartOptions} />
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Comparison Table */}
                                <div className="card overflow-x-auto">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Statistics</h2>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-4 py-3 text-left">Mess Name</th>
                                                <th className="px-4 py-3 text-center">Avg Rating</th>
                                                <th className="px-4 py-3 text-center">Total Reviews</th>
                                                <th className="px-4 py-3 text-center">5★</th>
                                                <th className="px-4 py-3 text-center">4★</th>
                                                <th className="px-4 py-3 text-center">3★</th>
                                                <th className="px-4 py-3 text-center">2★</th>
                                                <th className="px-4 py-3 text-center">1★</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonData.map((mess) => (
                                                <tr key={mess.mess_id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-semibold">{mess.name}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold">
                                                            {parseFloat(mess.avg_rating).toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{mess.total_ratings}</td>
                                                    <td className="px-4 py-3 text-center">{mess.five_star || 0}</td>
                                                    <td className="px-4 py-3 text-center">{mess.four_star || 0}</td>
                                                    <td className="px-4 py-3 text-center">{mess.three_star || 0}</td>
                                                    <td className="px-4 py-3 text-center">{mess.two_star || 0}</td>
                                                    <td className="px-4 py-3 text-center">{mess.one_star || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Rating Distribution */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {comparisonData.map((mess) => (
                                        <div key={mess.mess_id} className="card">
                                            <h3 className="font-bold text-gray-800 mb-3">{mess.name}</h3>
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    const count = mess[`${['', 'one', 'two', 'three', 'four', 'five'][star]}_star`] || 0;
                                                    const percentage = mess.total_ratings > 0 
                                                        ? (count / mess.total_ratings) * 100 
                                                        : 0;
                                                    
                                                    return (
                                                        <div key={star} className="flex items-center space-x-2">
                                                            <span className="text-sm w-8">{star}★</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                                                <div
                                                                    className="bg-primary-500 h-4 rounded-full transition-all"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm w-12 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center py-20">
                                <p className="text-gray-500 text-lg">
                                    Select at least 2 messes from the left panel to compare
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ComparePage;