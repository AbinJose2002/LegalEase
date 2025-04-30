// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Add Outlet import here
import axios from 'axios';
import AdvocateSidebar from './AdvocateSidebar.jsx';
import Navbar from '../../Navbar/Navbar';
import Client from './Client';
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';
import Case from './Case';
import Blog from './Blog';
import Meetings from './Meetings';
import Reviews from './Reviews';

const AdvocateHome = () => {
    // State variables
    const [cases, setCases] = useState([]);
    const [pendingCases, setPendingCases] = useState([]);
    const [activeCases, setActiveCases] = useState([]);
    const [closedCases, setClosedCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingPayments, setPendingPayments] = useState([]);
    const [showPaymentAlert, setShowPaymentAlert] = useState(false);
    const [advocateData, setAdvocateData] = useState(null);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [selected, setSelected] = useState(null); // Add this state variable to define 'selected'
    const [selectedCase, setSelectedCase] = useState(null); // Add this state variable to define 'selectedCase'
    const [advocateId, setAdvocateId] = useState(localStorage.getItem('advocateId')); // Add this state variable
    
    // Navigation
    const navigate = useNavigate();
    
    // Get advocate ID and token from localStorage
    const token = localStorage.getItem('advocatetoken');
    // Define advocateId here before using it
    
    useEffect(() => {
        // Check for fresh login flag
        const justLoggedIn = sessionStorage.getItem('advocateJustLoggedIn');
        
        // Verify if token exists and is valid
        const verifyToken = async () => {
            try {
                // Double-check token in case of page refresh
                const currentToken = localStorage.getItem('advtoken');
                
                if (!currentToken) {
                    console.warn("No advocate token found, redirecting to login");
                    
                    // Only redirect if not just logged in (prevents redirect loop)
                    if (!justLoggedIn) {
                        navigate('/advocate-login');
                    } else {
                        // This is a fresh login, token might be getting set asynchronously
                        // Wait briefly and retry
                        setTimeout(() => {
                            const retryToken = localStorage.getItem('advtoken');
                            if (!retryToken) {
                                console.warn("Still no token after retry, redirecting to login");
                                navigate('/advocate-login');
                            } else {
                                console.log("Token found after retry");
                                setTokenChecked(true);
                                // Clear the flag
                                sessionStorage.removeItem('advocateJustLoggedIn');
                            }
                        }, 500);
                        return;
                    }
                    return;
                }
                
                // Clear the flag if it exists
                if (justLoggedIn) {
                    sessionStorage.removeItem('advocateJustLoggedIn');
                }
                
                // Use the profile endpoint since verify-token is having issues
                const response = await axios.post('http://localhost:8080/api/advocate/profile', 
                    { token: currentToken },
                    { headers: { Authorization: `Bearer ${currentToken}` }}
                );
                
                if (response.data && response.data.success === "true") {
                    console.log("Token verified via profile endpoint");
                    
                    // Extract and save advocate ID if not already saved
                    if (response.data.advocate && response.data.advocate._id) {
                        const newAdvocateId = response.data.advocate._id;
                        console.log(`Setting advocateId in localStorage: ${newAdvocateId}`);
                        localStorage.setItem('advocateId', newAdvocateId);
                        setAdvocateId(newAdvocateId); // Update state as well
                    }
                    
                    // Store advocate data if available
                    if (response.data.advocate) {
                        setAdvocateData(response.data.advocate);
                    }
                    
                    setTokenChecked(true);
                } else {
                    console.warn("Token verification failed:", response.data?.message);
                    localStorage.removeItem('advtoken');
                    localStorage.removeItem('advocateId');
                    navigate('/advocate-login');
                }
            } catch (error) {
                console.error("Token verification error:", error);
                
                // Don't redirect immediately if there's a server error
                if (error.response?.status !== 500) {
                    localStorage.removeItem('advtoken');
                    localStorage.removeItem('advocateId');
                    navigate('/advocate-login');
                } else {
                    // For server errors, we'll try to proceed but show an error message
                    setError("Server error. Some features may be unavailable.");
                    setTokenChecked(true);
                }
            }
        };
        
        verifyToken();
    }, [navigate]);
    
    useEffect(() => {
        // Only fetch data if token is verified
        if (tokenChecked && advocateId) {
            fetchAdvocateCases();
            fetchPendingPayments();
            fetchAdvocateProfile();
        }
    }, [tokenChecked, advocateId]);
    
    const fetchAdvocateProfile = async () => {
        if (!token || !advocateId) return;
        
        try {
            const response = await axios.get(`http://localhost:8080/api/advocate/profile/${advocateId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setAdvocateData(response.data.advocate);
            }
        } catch (error) {
            console.error("Error fetching advocate profile:", error);
        }
    };
    
    const fetchPendingPayments = async () => {
        try {
            // Only attempt to fetch if we have the advocate ID
            if (!advocateId) {
                console.error("Cannot fetch payments: No advocate ID available");
                return;
            }
            
            const response = await axios.get(
                `http://localhost:8080/api/payment/advocate/${advocateId}/pending`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setPendingPayments(response.data.data);
                setShowPaymentAlert(response.data.data.length > 0);
            }
        } catch (error) {
            console.error("Error fetching pending payments:", error);
        }
    };

    const fetchAdvocateCases = async () => {
        if (!token || !advocateId) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            // Add a timeout to handle potential request hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await axios.post(
                'http://localhost:8080/api/case/fetch', 
                { advToken: token },
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                }
            );
            
            clearTimeout(timeoutId);
            
            if (response.data.success === "true") {
                setCases(response.data.clients);
                
                // Filter cases by status
                const pending = response.data.clients.filter(c => c.status === "Not Approved");
                const active = response.data.clients.filter(c => c.status === "Open");
                const closed = response.data.clients.filter(c => c.status === "Closed");
                
                setPendingCases(pending);
                setActiveCases(active);
                setClosedCases(closed);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            
            // If we get a 401, we need to log out
            if (error.response?.status === 401) {
                localStorage.removeItem('advtoken');
                localStorage.removeItem('advocateId');
                navigate('/advocate-login');
            } else {
                setError("Failed to load cases. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCase = async (caseNum, caseType) => {
        try {
            // ...existing confirmation code...
            
            // Refresh cases and payments after confirmation
            fetchAdvocateCases();
            fetchPendingPayments();
        } catch (error) {
            // ...existing error handling...
        }
    };

    const handleCaseStatusChange = (caseId, action) => {
        console.log(`Case status change called with: ${caseId}, ${action}`);
        
        if (action === 'Select') {
            // Find the case in the list
            const selectedCase = advocateCases.find(c => c._id === caseId);
            
            if (selectedCase) {
                console.log("Setting selected case:", selectedCase);
                setSelectedCase(selectedCase);
            } else {
                console.error("Case not found in list:", caseId);
                
                // If case is not in the current list, fetch it directly
                const fetchCase = async () => {
                    try {
                        const token = localStorage.getItem('advtoken');
                        const response = await axios.get(
                            `http://localhost:8080/api/case/${caseId}`,
                            { headers: { Authorization: `Bearer ${token}` }}
                        );
                        
                        if (response.data && response.data.data) {
                            setSelectedCase(response.data.data);
                        }
                    } catch (error) {
                        console.error("Error fetching specific case:", error);
                    }
                };
                
                fetchCase();
            }
        } else if (action === 'Back') {
            setSelectedCase(null);
        }
    };

    const renderComponent = () => {
        switch (selected) {
            case 'client':
                return <Client />;
            case 'profile':
                return <Profile />;
            case 'payment':
                return <Payment />;
            case 'case':
                return <Case 
                    caseData={selectedCase} 
                    onStatusChange={handleCaseStatusChange} 
                    advocateId={advocateId}
                />;
            case 'document':
                return <Document />;
            case 'blog':
                return <Blog />;
            case 'meetings':
                return <Meetings />;
            case 'reviews':
                return <Reviews />;
            default:
                return <Client />;
        }
    };

    // Log out function
    const handleLogout = () => {
        localStorage.removeItem('advtoken');
        localStorage.removeItem('advocateId');
        navigate('/advocate-login');
    };

    return (
        <div className="advocate-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <AdvocateSidebar selected={selected} setSelected={setSelected} />
                <main className="dashboard-content">
                    <div className="content-wrapper">
                        {renderComponent()}
                        <Outlet /> {/* This now works with the proper import */}
                    </div>
                </main>
            </div>
            <div className="container-fluid mt-4">
                {showPaymentAlert && pendingPayments.length > 0 && (
                    <div className="alert alert-warning">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Payment Reminder:</strong> You have {pendingPayments.length} pending advance {pendingPayments.length === 1 ? 'payment' : 'payments'}.
                            </div>
                            <button 
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => setActiveTab('payments')}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Add 'payments' to your existing tabs */}
                <ul className="nav nav-tabs mt-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            Dashboard
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'cases' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cases')}
                        >
                            Cases
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            Payments
                            {pendingPayments.length > 0 && (
                                <span className="badge bg-warning text-dark ms-2">
                                    {pendingPayments.length}
                                </span>
                            )}
                        </button>
                    </li>
                    {/* ...other tabs... */}
                </ul>
                
                {activeTab === 'payments' && (
                    <div className="card mt-4">
                        <div className="card-header">
                            <h5 className="mb-0">Pending Payments</h5>
                        </div>
                        <div className="card-body">
                            {pendingPayments.length === 0 ? (
                                <p className="text-muted">No pending payments at this time.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Case</th>
                                                <th>Client</th>
                                                <th>Amount</th>
                                                <th>Type</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingPayments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td>{payment.caseTitle} ({payment.caseNumber})</td>
                                                    <td>{payment.clientName}</td>
                                                    <td>₹{payment.amount}</td>
                                                    <td>
                                                        <span className="badge bg-info text-dark">
                                                            {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="badge bg-warning text-dark">
                                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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