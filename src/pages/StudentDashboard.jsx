import React, { useState, useEffect } from 'react';
// API client for making requests to backend
import api from '../api/api';

import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');  // Error messages
    const [loading, setLoading] = useState(true);  // Loading state while fetching

    // Meeting states
    const [meetings, setMeetings] = useState([]);


    // Function to fetch all meetings from backend
    const fetchMeetings = async () => {
        try {
            const response = await api.get('/meetings/');
            setMeetings(response.data);
        } catch (err) {
            console.error('Failed to fetch meetings:', err);
            setError(prev => prev ? prev : 'Failed to load some content. Please refresh.');
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

    return (
        <div className="dashboard">
            {/* Dashboard header */}
            <header className="dashboard-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p className="text-muted">Stay active on your live meetings</p>
                </div>
            </header>

            {/* Show error if fetching failed */}
            {error && <div className="error-message">{error}</div>}

            {/* Live Meetings Section */}
            <div className="course-list-section" style={{ marginBottom: '2.5rem' }}>
                <h2>Live Meetings</h2>
                <div className="course-grid">
                    {loading ? (
                        // Skeleton loading pulse effect
                        [1, 2, 3].map(i => (
                            <div key={i} className="stat-card" style={{ height: '80px' }}></div>
                        ))
                    ) : (
                        <>
                            {meetings.map(meeting => (
                                <div key={meeting.id} className="stat-card" style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{meeting.title}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                                                ID: <code style={{ color: '#059669' }}>{meeting.room_id}</code>
                                            </p>
                                            <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                                                Scheduled: {new Date(meeting.created_at.endsWith('Z') ? meeting.created_at : meeting.created_at + 'Z').toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleJoinMeeting(meeting.room_id)}
                                        >
                                            Join Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {meetings.length === 0 && (
                                <div className="text-center" style={{ gridColumn: '1 / -1', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <p className="text-muted">No live meetings at the moment.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default StudentDashboard;
