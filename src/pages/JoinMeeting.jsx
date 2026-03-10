import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JoinMeeting = () => {
    const { room_id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const { user, isAuthenticated } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            console.log('User already authenticated, bypassing name prompt...');
            // Ensure username is set if somehow missing (though AuthContext handles it now)
            if (!localStorage.getItem('username')) {
                localStorage.setItem('username', user.email.split('@')[0]);
            }
            localStorage.setItem('joinMode', 'normal');
            navigate(`/meeting/${room_id}`);
        }
    }, [isAuthenticated, user, navigate, room_id]);

    const handleJoin = (mode) => {
        if (name.trim()) {
            localStorage.setItem('username', name.trim());
            localStorage.setItem('joinMode', mode);
            navigate(`/meeting/${room_id}`);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f3f4f6'
        }}>
            <div style={{
                background: '#fff',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#008080', marginBottom: '0.5rem' }}>Ready to Join?</h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Enter your name to appear in the meeting</p>

                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        required
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#008080'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => handleJoin('normal')}
                        disabled={!name.trim()}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#008080',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: name.trim() ? 1 : 0.7,
                            transition: 'background 0.2s'
                        }}
                    >
                        Join Normally
                    </button>

                    <button
                        onClick={() => handleJoin('companion')}
                        disabled={!name.trim()}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#f8fafc',
                            color: '#475569',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: name.trim() ? 1 : 0.7,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (name.trim()) {
                                e.target.style.background = '#f1f5f9';
                                e.target.style.borderColor = '#cbd5e1';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#f8fafc';
                            e.target.style.borderColor = '#e2e8f0';
                        }}
                    >
                        Join in Companion Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinMeeting;
