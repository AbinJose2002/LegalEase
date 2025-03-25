// src/components/Dashboard.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdvocateSidebar from './AdvocateSidebar.jsx';
import Navbar from '../../Navbar/Navbar'
import Client from './Client';
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';
import Case from './Case';
import Blog from './Blog';
import Meetings from './Meetings';

const AdvocateHome = () => {
    const [selected, setSelected] = useState('client'); // Default selected link

    return (
        <div className="advocate-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <AdvocateSidebar selected={selected} setSelected={setSelected} />
                <main className="dashboard-content">
                    <div className="content-wrapper">
                        {/* Component rendering switch statement */}
                        {(() => {
                            switch (selected) {
                                case 'client':
                                    return <Client />;
                                case 'profile':
                                    return <Profile />;
                                case 'payment':
                                    return <Payment />;
                                case 'case':
                                    return <Case />;
                                case 'document':
                                    return <Document />;
                                case 'blog':
                                    return <Blog />;
                                case 'meetings':
                                    return <Meetings />;
                                default:
                                    return <Client />;
                            }
                        })()}
                        <Outlet />
                    </div>
                </main>
            </div>
            <style>{`
                .advocate-dashboard {
                    min-height: 100vh;
                    background: #f8f9fa;
                }
                
                .dashboard-container {
                    display: flex;
                    position: relative;
                }
                
                .dashboard-content {
                    flex: 1;
                    padding: 2rem;
                    background: #f8f9fa;
                }
                
                .content-wrapper {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 0 15px rgba(0,0,0,0.05);
                }
                
                @media (max-width: 768px) {
                    .dashboard-content {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdvocateHome;