import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// API client for making requests to backend
import api from '../api/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState('');  // Error messages
    const [loading, setLoading] = useState(true);  // Loading state while fetching data

    // Meeting states
    const [meetings, setMeetings] = useState([]);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingLoading, setMeetingLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [meetingError, setMeetingError] = useState(''); // Improved error handling
    const [meetingSuccess, setMeetingSuccess] = useState('');


    // Function to fetch all meetings from backend
    const fetchMeetings = async () => {
        try {
            setMeetingError('');
            const response = await api.get('/meetings/');
            setMeetings(response.data);
        } catch (err) {
            console.error('Failed to fetch meetings:', err);
            setMeetingError('Failed to fetch existing meetings.');
        }
    };

    // Fetch data when component first loads
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchMeetings();
            setLoading(false);
        };
        loadData();
    }, []);

    // Handle meeting creation
    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        if (!meetingTitle.trim()) return;

        setMeetingLoading(true);
        setMeetingError('');
        setMeetingSuccess('');
        try {
            await api.post('/meetings/', { title: meetingTitle });
            setMeetingTitle('');
            setMeetingSuccess('Meeting link generated successfully!');
            alert('Meeting link generated successfully!');
            setTimeout(() => setMeetingSuccess(''), 5000); // Clear after 5 seconds
            await fetchMeetings();
        } catch (err) {
            console.error('Failed to create meeting:', err);
            setMeetingError(err.response?.data?.detail || 'Error creating meeting. Please try again.');
        } finally {
            setMeetingLoading(false);
        }
    };

    // Handle meeting deletion
    const handleDeleteMeeting = async (meetingId) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;

        try {
            await api.delete(`/meetings/${meetingId}`);
            await fetchMeetings();
        } catch (err) {
            console.error('Failed to delete meeting:', err);
            setMeetingError('Failed to delete meeting. Please try again.');
        }
    };

    // Handle copy link to clipboard
    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopyStatus(url);
            setTimeout(() => setCopyStatus(''), 2000);
        });
    };


    // Show loading message while fetching initial data
    if (loading) return <div className="loading">Loading dashboard data...</div>;

    return (
        <div className="dashboard">
            {/* Dashboard header with title */}
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
            </header>

            {error && <div className="error-message">{error}</div>}

            {/* Meeting Section - Admin only visibility check */}
            {user?.role === 'admin' && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2>Create Meeting</h2>
                    {meetingError && <div className="error-message" style={{ marginTop: '1rem' }}>{meetingError}</div>}
                    {meetingSuccess && <div className="success-message" style={{ marginTop: '1rem' }}>{meetingSuccess}</div>}
                    <form onSubmit={handleCreateMeeting} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Meeting Title"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={meetingLoading}>
                            {meetingLoading ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </form>
                </div>
            )}

            {/* Content Tabs/Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>


                {/* Meetings List section */}
                <div className="course-list-section">
                    <h2>Scheduled Meetings</h2>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Room ID</th>
                                    <th>Created At</th>
                                    <th>Link</th>
                                    <th>Action</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetings.map(meeting => (
                                    <tr key={meeting.id}>
                                        <td>{meeting.title}</td>
                                        <td>
                                            <code style={{ background: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                                {meeting.room_id}
                                            </code>
                                        </td>
                                        <td>{new Date(meeting.created_at.endsWith('Z') ? meeting.created_at : meeting.created_at + 'Z').toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn-edit"
                                                onClick={() => copyToClipboard(meeting.meeting_url)}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {copyStatus === meeting.meeting_url ? 'Copied Link!' : 'Copy Link'}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-primary"
                                                onClick={() => navigate(`/meeting/${meeting.room_id}`)}
                                                style={{ padding: '0.4rem 1rem' }}
                                            >
                                                Join
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteMeeting(meeting.id)}
                                                style={{ padding: '0.4rem 1rem' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {meetings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center">No meetings scheduled.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
