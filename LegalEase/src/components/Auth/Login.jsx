import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [stableMount, setStableMount] = useState(false);
    const mountedRef = useRef(true);
    const navigate = useNavigate();
    
    // Ensure component stays mounted reliably
    useEffect(() => {
        console.log("Login component mounting...");
        
        // Track component mount state
        mountedRef.current = true;
        
        // Stabilize the component with a definite timeout
        setTimeout(() => {
            if (mountedRef.current) {
                console.log("Login component stable");
                setStableMount(true);
                
                // After mounting is stable, check for token once
                const token = localStorage.getItem("usertoken");
                if (token) {
                    console.log("User has token already");
                    // But don't auto-redirect
                }
            }
        }, 300);
        
        // Force refresh if page is flickering
        const visibilityTimeout = setTimeout(() => {
            if (document.hidden || !document.hasFocus()) {
                console.log("Page visibility issues detected");
                window.location.href = window.location.href;
            }
        }, 1000);
        
        return () => {
            console.log("Login component unmounting");
            mountedRef.current = false;
            clearTimeout(visibilityTimeout);
        };
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mountedRef.current) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            // Explicitly set Axios timeout
            const response = await axios.post(
                "http://localhost:8080/api/user/login", 
                { username, password },
                { timeout: 10000 }
            );
            
            console.log("Login response:", response.data);
            
            if (response.data.success && response.data.data) {
                // Make sure we're storing the actual token
                const token = response.data.data;
                
                // Validate token format (simple check)
                if (!token || token.split('.').length !== 3) {
                    setError('Invalid token received from server');
                    setIsLoading(false);
                    return;
                }
                
                // Store token
                localStorage.setItem("usertoken", token);
                console.log("Token stored successfully:", token.substring(0, 20) + "...");
                
                // Update UI and navigate
                setIsLoading(false);
                if (mountedRef.current) {
                    navigate('/userdash');
                }
            } else {
                if (mountedRef.current) {
                    setError(response.data.message || 'Login failed - invalid response');
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            if (mountedRef.current) {
                setError('Server error. Please try again.');
                setIsLoading(false);
            }
        }
    };

    // Return a clear loading state while waiting for stable mount
    if (!stableMount) {
        return (
            <>
                <Navbar />
                <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Preparing login form...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mt-5" style={{minHeight: "80vh"}}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow border-0 rounded-3" id="login-card">
                            <div className="card-body p-5">
                                <h2 className="card-title text-center mb-4 fw-bold">Welcome Back</h2>
                                <p className="text-center text-muted mb-4">Enter your credentials to access your account</p>
                                
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} id="login-form">
                                    <div className="form-group mb-3">
                                        <label htmlFor="username" className="form-label fw-semibold">Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg py-2"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg py-2"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="remember" />
                                            <label className="form-check-label" htmlFor="remember">
                                                Remember me
                                            </label>
                                        </div>
                                        <a href="#" className="text-decoration-none">Forgot password?</a>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100 py-3 fw-bold"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Logging in...
                                            </>
                                        ) : 'Sign In'}
                                    </button>
                                    <div className="text-center mt-4">
                                        New User? <Link to='/register' className="text-decoration-none fw-semibold">Create an account</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;