import React, { useState, useEffect } from 'react';
// API client for making requests to backend
import api from '../api/api';

import { useNavigate } from 'react-router-dom';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');  // Error messages
    const [loading, setLoading] = useState(true);  // Loading state while fetching

    // Meeting states
    const [meetings, setMeetings] = useState([]);
    const [copyStatus, setCopyStatus] = useState('');


    // Function to fetch all meetings from backend
    const fetchMeetings = async () => {
        try {
            const response = await api.get('/meetings/');
            setMeetings(response.data);
        } catch (err) {
            console.error('Failed to fetch meetings:', err);
            setError(prev => prev ? prev : 'Some data failed to load. Please refresh.');
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

    // Handle join meeting
    const handleJoinMeeting = (roomId) => {
        navigate(`/meeting/${roomId}`);
    };


    // Show loading message while fetching initial data
    if (loading) return <div className="loading">Loading dashboard data...</div>;

    return (
        <div className="dashboard">
            {/* Dashboard header */}
            <header className="dashboard-header">
                <h1>Tutor Dashboard</h1>
                <p className="text-muted">Manage assigned course content and join meetings</p>
            </header>

            {/* Show error if fetching failed */}
            {error && <div className="error-message">{error}</div>}

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
                                                onClick={() => handleJoinMeeting(meeting.room_id)}
                                                style={{ padding: '0.4rem 1rem' }}
                                            >
                                                Join
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {meetings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No meetings scheduled.</td>
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

export default TutorDashboard;
