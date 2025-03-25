// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../../styles/animations.css';
import Case from './Case';
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';
import Consultation from './Consultation';

const Home = () => {
    const [selected, setSelected] = useState('case');
    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const renderComponent = () => {
        switch (selected) {
            case 'case':
                return <div className="fade-in"><Case /></div>;
            case 'profile':
                return <div className="slide-in-right"><Profile /></div>;
            case 'payment':
                return <div className="slide-in-up"><Payment /></div>;
            case 'document':
                return <div className="fade-in"><Document /></div>;
            case 'consult':
                return <div className="slide-in-right"><Consultation /></div>;
            default:
                return <div className="fade-in"><Case /></div>;
        }
    };

    return (
        <div className={`dashboard-container ${pageLoaded ? 'fade-in' : ''}`}>
            <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar setSelected={setSelected} />
                <main className="dashboard-main glass-effect" style={{ 
                    padding: '2rem',
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    margin: '20px',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
                }}>
                    <header className="dashboard-header mb-4">
                        <h1 className="gradient-text">{selected.charAt(0).toUpperCase() + selected.slice(1)}</h1>
                        <div className="header-underline" style={{
                            width: '50px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #3498db, #2ecc71)',
                            marginTop: '8px'
                        }}/>
                    </header>
                    <div className="dashboard-content">
                        {renderComponent()}
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Home;