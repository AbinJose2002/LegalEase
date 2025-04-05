// src/components/Dashboard.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../../styles/animations.css';
import Case from './Case';  // Remove .jsx extension
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';
import Consultation from './Consultation';
import Review from './Review';
import axios from 'axios';
import CaseDebug from './CaseDebug';

export default function Home() {
    // State declarations
    const [selected, setSelected] = useState('case');
    const [pageLoaded, setPageLoaded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [showDebug, setShowDebug] = useState(false);
    const [componentKey, setComponentKey] = useState(Date.now());
    const [renderStable, setRenderStable] = useState(false); // New state for stability tracking
    
    // Refs
    const mountedRef = useRef(true);
    const navigate = useNavigate();

    // Add stability check
    useEffect(() => {
        console.log("Setting up render stability");
        
        // Force stable rendering state after a short delay
        const stabilityTimer = setTimeout(() => {
            if (mountedRef.current) {
                setRenderStable(true);
                console.log("Render stability established");
            }
        }, 300);
        
        return () => clearTimeout(stabilityTimer);
    }, []);

    // Effect to update component key when selected tab changes
    useEffect(() => {
        if (renderStable) {
            setComponentKey(Date.now());
        }
    }, [selected, renderStable]);

    // Primary auth check effect
    useEffect(() => {
        console.log("Home component mounting");
        mountedRef.current = true;
        
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("usertoken");
                if (!token) {
                    console.log("No auth token found");
                    if (mountedRef.current) {
                        setIsAuthenticated(false);
                        navigate('/login');
                    }
                    return;
                }
                
                // Validate token format (simple check)
                if (token.split('.').length !== 3) {
                    console.log("Invalid token format");
                    localStorage.removeItem("usertoken");
                    if (mountedRef.current) {
                        setIsAuthenticated(false);
                        navigate('/login');
                    }
                    return;
                }
                
                // Skip token verification if API endpoint doesn't exist
                
                // For now, just accept the token's existence
                console.log("Auth token found");
                if (mountedRef.current) {
                    setIsAuthenticated(true);
                    setTimeout(() => {
                        if (mountedRef.current) {
                            setPageLoaded(true);
                        }
                    }, 100); // Delay page loaded state to ensure smooth transitions
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (mountedRef.current) {
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            }
        };
        
        if (renderStable) {
            // Start authentication check only after render is stable
            checkAuth();
        }
        
        return () => {
            console.log("Home component unmounting");
            mountedRef.current = false;
        };
    }, [navigate, renderStable]);

    // Function to render the correct component based on selection with tracking
    const renderComponent = useCallback(() => {
        if (!isAuthenticated || !renderStable) return null;
        
        console.log(`Rendering component for tab: ${selected}`);
        
        switch (selected) {
            case 'case':
                return (
                    <div className="content-container fade-in" style={{
                        minHeight: "700px", // Increased from 500px to match Case component
                        display: "block", 
                        position: "relative",
                        opacity: 1
                    }}>
                        <Case key={`case-${componentKey}`} />
                        {process.env.NODE_ENV !== 'production' && (
                            <div className="mt-4 text-end">
                                <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowDebug(!showDebug)}
                                >
                                    {showDebug ? 'Hide' : 'Show'} API Debugger
                                </button>
                                {showDebug && <CaseDebug />}
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return <div className="slide-in-right"><Profile /></div>;
            case 'payment':
                return <div className="slide-in-up"><Payment /></div>;
            case 'document':
                return <div className="fade-in"><Document /></div>;
            case 'consult':
                return <div className="slide-in-right"><Consultation /></div>;
            case 'review':
                return <div className="slide-in-right"><Review /></div>;
            default:
                return (
                    <div className="content-container fade-in" style={{
                        minHeight: "700px", // Increased from 500px for consistency
                        display: "block",
                        position: "relative",
                        opacity: 1
                    }}>
                        <Case key={`case-default-${componentKey}`} />
                    </div>
                );
        }
    }, [selected, isAuthenticated, componentKey, showDebug, renderStable]);

    // Loading state with explicit message
    if (!renderStable || isAuthenticated === null) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100%' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Unauthorized state
    if (isAuthenticated === false) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Authentication required
                    </div>
                    <p>Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{
            display: 'block', 
            opacity: 1,
            visibility: 'visible',
            position: 'relative',
            minHeight: '100vh'
        }}>
            <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar setSelected={setSelected} />
                <main className="dashboard-main glass-effect" style={{ 
                    padding: '2rem',
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    margin: '20px',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                    position: 'relative',
                    display: 'block',
                    minHeight: '800px' // Increased height for main container
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
                    <div className="dashboard-content" style={{
                        minHeight: "700px", // Increased for consistency
                        position: "relative", 
                        display: "block",
                        opacity: 1
                    }}>
                        {renderComponent()}
                    </div>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}