import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import API from '../utils/api';
import { FiTrendingUp, FiUsers, FiStar, FiDownload, FiPlus, FiEdit2, FiTrash2, FiShield } from 'react-icons/fi';

const AdminDashboard = () => {
    // Existing State
    const [analytics, setAnalytics] = useState(null);
    const [messes, setMesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMess, setEditingMess] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        is_active: true
    });

    // Pending Owners & Messages State
    const [pendingOwners, setPendingOwners] = useState([]);
    const [message, setMessage] = useState('');

    // Assignment State
    const [assigningMessFor, setAssigningMessFor] = useState(null);
    const [selectedMessId, setSelectedMessId] = useState('');

    // NEW: Active Assignments State
    const [activeAssignments, setActiveAssignments] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Updated Promise.all to fetch the active assignments as well
            const [analyticsRes, messesRes, pendingRes, activeRes] = await Promise.all([
                API.get('/analytics').catch(err => ({ success: false, data: null })),
                API.get('/mess').catch(err => ({ success: false, data: [] })),
                API.get('/auth/admin/pending-owners').catch(err => ({ success: false, data: [] })),
                API.get('/auth/admin/active-owners').catch(err => ({ success: false, data: [] }))
            ]);

            if (analyticsRes.success) {
                setAnalytics(analyticsRes.data);
            }
            
            if (messesRes.success) {
                setMesses(messesRes.data);
            }

            if (pendingRes.success) {
                setPendingOwners(pendingRes.data || []);
            }

            // Save the newly fetched active assignments
            if (activeRes.success) {
                setActiveAssignments(activeRes.data || []);
            }

        } catch (err) {
            setError('Failed to load dashboard data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId, newStatus, messId = null) => {
        if (newStatus === 'approved' && !messId) {
            alert("Please select a mess to assign to this owner.");
            return;
        }

        try {
            const response = await API.patch('/auth/admin/update-status', {
                targetUserId: userId,
                newStatus: newStatus,
                messId: messId 
            });

            if (response.success) {
                setMessage(`Account successfully ${newStatus}!`);
                setPendingOwners(prevOwners => prevOwners.filter(owner => owner.user_id !== userId));
                setAssigningMessFor(null); 
                setSelectedMessId('');
                fetchData(); // Refresh all tables after status update
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error(`Failed to ${newStatus} owner:`, error);
            alert(`Failed to update status. Please check your console.`);
        }
    };

    const handleExportCSV = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/analytics/export', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mess-ratings-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                alert('CSV exported successfully!');
            } else {
                alert('Failed to export CSV');
            }
        } catch (error) {
            alert('Failed to export data');
        }
    };

    const handleOpenModal = (mess = null) => {
        if (mess) {
            setEditingMess(mess);
            setFormData({
                name: mess.name,
                location: mess.location,
                description: mess.description || '',
                is_active: mess.is_active
            });
        } else {
            setEditingMess(null);
            setFormData({
                name: '',
                location: '',
                description: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMess(null);
    };

    const handleSubmitMess = async (e) => {
        e.preventDefault();
        try {
            if (editingMess) {
                await API.put(`/mess/${editingMess.mess_id}`, formData);
                alert('Mess updated successfully!');
            } else {
                await API.post('/mess', formData);
                alert('Mess created successfully!');
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            alert(`Failed to ${editingMess ? 'update' : 'create'} mess: ` + error.message);
        }
    };

    const handleDeleteMess = async (messId) => {
        if (!confirm('Are you sure you want to delete this mess?')) return;
        try {
            await API.delete(`/mess/${messId}`);
            alert('Mess deleted successfully!');
            fetchData();
        } catch (error) {
            alert('Failed to delete mess: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
                            <h3 className="font-bold mb-2">Error</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchData} className="btn-primary">Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    const overview = analytics?.overview || {
        total_messes: 0,
        total_users: 0,
        total_ratings: 0,
        overall_avg_rating: 0
    };

    const topMesses = analytics?.topMesses || [];
    const distribution = analytics?.distribution || [];
    const recentRatings = analytics?.recentRatings || [];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <div className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">Monitor and manage mess ratings</p>
                    </div>
                    <button onClick={handleExportCSV} className="btn-primary flex items-center space-x-2">
                        <FiDownload />
                        <span>Export CSV</span>
                    </button>
                </div>

                {/* Global Success Message for Approvals */}
                {message && (
                    <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-medium animate-pulse mb-6">
                        ✅ {message}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 mb-1 text-sm">Total Messes</p>
                                <p className="text-3xl font-bold">{overview.total_messes}</p>
                            </div>
                            <FiTrendingUp className="text-5xl text-primary-200" />
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-1 text-sm">Total Users</p>
                                <p className="text-3xl font-bold">{overview.total_users}</p>
                            </div>
                            <FiUsers className="text-5xl text-blue-200" />
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 mb-1 text-sm">Total Ratings</p>
                                <p className="text-3xl font-bold">{overview.total_ratings}</p>
                            </div>
                            <FiStar className="text-5xl text-yellow-200" />
                        </div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-1 text-sm">Avg Rating</p>
                                <p className="text-3xl font-bold">
                                    {parseFloat(overview.overall_avg_rating || 0).toFixed(1)}
                                </p>
                            </div>
                            <FiStar className="text-5xl text-green-200 fill-current" />
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Pending Approvals Widget                   */}
                {/* ========================================== */}
                <div className="card mb-8 overflow-hidden !p-0">
                    <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t-xl">
                        <h2 className="text-lg font-bold flex items-center">
                            <FiShield className="mr-2" /> Pending Contractor Approvals
                        </h2>
                        {pendingOwners.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {pendingOwners.length} Pending
                            </span>
                        )}
                    </div>

                    <div>
                        {pendingOwners.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic">
                                No pending accounts. You are all caught up!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                                            <th className="px-6 py-4 font-semibold">Applicant Name</th>
                                            <th className="px-6 py-4 font-semibold">Email Address</th>
                                            <th className="px-6 py-4 font-semibold">Application Date</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingOwners.map((owner) => (
                                            <tr key={owner.user_id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-800">{owner.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{owner.email}</td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">
                                                    {new Date(owner.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {assigningMessFor === owner.user_id ? (
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <select 
                                                                value={selectedMessId}
                                                                onChange={(e) => setSelectedMessId(e.target.value)}
                                                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                            >
                                                                <option value="">Select a Mess...</option>
                                                                {messes.map(m => (
                                                                    <option key={m.mess_id} value={m.mess_id}>{m.name}</option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(owner.user_id, 'approved', selectedMessId)}
                                                                className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => setAssigningMessFor(null)}
                                                                className="bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-x-2">
                                                            <button 
                                                                onClick={() => setAssigningMessFor(owner.user_id)}
                                                                className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:border-green-300 font-bold px-4 py-1.5 rounded-lg text-sm transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(owner.user_id, 'rejected')}
                                                                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 font-bold px-4 py-1.5 rounded-lg text-sm transition-all"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* ACTIVE MESS ASSIGNMENTS (NEW WIDGET)       */}
                {/* ========================================== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <span className="mr-2">🔗</span> Active Mess Assignments
                        </h2>
                    </div>
                    
                    {activeAssignments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 italic">
                            No active owners assigned to any messes yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                                        <th className="px-6 py-3 font-semibold">Dining Hall / Mess</th>
                                        <th className="px-6 py-3 font-semibold">Assigned Manager</th>
                                        <th className="px-6 py-3 font-semibold">Contact Email</th>
                                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeAssignments.map((assignment) => (
                                        <tr key={assignment.user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {assignment.mess_name}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">
                                                {assignment.owner_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {assignment.email}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rating Distribution - Visual Bars */}
                {distribution.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Rating Distribution</h2>
                        <div className="space-y-4">
                            {distribution.reverse().map((item) => {
                                const maxCount = Math.max(...distribution.map(d => d.count));
                                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                const colors = {
                                    5: 'bg-green-500', 4: 'bg-blue-500', 3: 'bg-yellow-500', 2: 'bg-orange-500', 1: 'bg-red-500'
                                };
                                
                                return (
                                    <div key={item.rating_value} className="flex items-center space-x-4">
                                        <div className="w-16 text-sm font-semibold text-gray-700">
                                            {item.rating_value} Star{item.rating_value !== 1 ? 's' : ''}
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                                            <div
                                                className={`${colors[item.rating_value]} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                                                style={{ width: `${percentage}%` }}
                                            >
                                                <span className="text-white font-bold text-sm">{item.count}</span>
                                            </div>
                                        </div>
                                        <div className="w-16 text-sm text-gray-600 text-right">
                                            {maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Top Messes */}
                {topMesses.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Rated Messes</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left">Rank</th>
                                        <th className="px-4 py-3 text-left">Mess Name</th>
                                        <th className="px-4 py-3 text-left">Location</th>
                                        <th className="px-4 py-3 text-center">Avg Rating</th>
                                        <th className="px-4 py-3 text-center">Total Ratings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topMesses.map((mess, index) => (
                                        <tr key={mess.mess_id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold">
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{mess.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{mess.location}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-yellow-600 font-bold">
                                                    ★ {parseFloat(mess.avg_rating).toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">{mess.rating_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manage Messes */}
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Manage Messes</h2>
                        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
                            <FiPlus />
                            <span>Add Mess</span>
                        </button>
                    </div>

                    {messes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No messes found. Click "Add Mess" to create one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left">Name</th>
                                        <th className="px-4 py-3 text-left">Location</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Ratings</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messes.map((mess) => (
                                        <tr key={mess.mess_id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold">{mess.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{mess.location}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                                                    mess.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {mess.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">{mess.total_ratings || 0}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => handleOpenModal(mess)} className="text-blue-600 hover:text-blue-800 p-2" title="Edit">
                                                        <FiEdit2 />
                                                    </button>
                                                    <button onClick={() => handleDeleteMess(mess.mess_id)} className="text-red-600 hover:text-red-800 p-2" title="Delete">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Reviews */}
                {recentRatings.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reviews</h2>
                        <div className="space-y-3">
                            {recentRatings.map((rating) => (
                                <div key={rating.rating_id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="font-semibold text-gray-800">{rating.user_name}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-sm text-gray-600">{rating.mess_name}</span>
                                            </div>
                                            {rating.feedback && <p className="text-gray-700">{rating.feedback}</p>}
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(rating.date).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="ml-4">
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
                                                ★ {rating.rating_value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMess ? 'Edit Mess' : 'Add New Mess'}>
                <form onSubmit={handleSubmitMess} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mess Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[100px] resize-none" />
                    </div>
                    {editingMess && (
                        <div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                    )}
                    <div className="flex space-x-3">
                        <button type="submit" className="btn-primary flex-1">{editingMess ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            <Footer />
        </div>
    );
};

export default AdminDashboard;