import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar'
import axios from 'axios'
import { Link } from 'react-router-dom';

const AdvocateLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            setError('');
            
            // Check email and password
            if (!username || !password) {
                setError('Please enter both email and password');
                setIsSubmitting(false);
                return;
            }
            
            const response = await axios.post('http://localhost:8080/api/advocate/login', {
                username: username,
                password: password
            });
            
            console.log('Login response:', response.data);
            
            if (response.data.success === true) {
                // Get advocate token
                const token = response.data.data;
                
                // Store token with correct key - Make sure this matches what AdvocateHome.jsx expects
                localStorage.setItem('advtoken', token);
                
                // Get advocate details to extract ID
                try {
                    const userResponse = await axios.post('http://localhost:8080/api/advocate/profile', 
                        { token },
                        { headers: { Authorization: `Bearer ${token}` }}
                    );
                    
                    if (userResponse.data.success === "true" && userResponse.data.advocate) {
                        localStorage.setItem('advocateId', userResponse.data.advocate._id);
                        console.log("Advocate ID saved:", userResponse.data.advocate._id);
                        
                        // Set a session storage flag to indicate fresh login
                        sessionStorage.setItem('advocateJustLoggedIn', 'true');
                    }
                } catch (userError) {
                    console.warn("Could not fetch advocate details:", userError);
                }
                
                // Redirect to advocate dashboard with small delay to ensure storage is complete
                setTimeout(() => {
                    navigate('/advocatedash');
                }, 100);
            } else {
                setError(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response?.data?.message === 'Your account is not verified yet. Kindly wait for the verification') {
                setError('Your account is pending verification. Please wait for admin approval.');
            } else {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title text-center">Advocate Login</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="username">Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {error && <p className="text-danger">{error}</p>}
                                    <p>New User? <Link to='/advocate-register'>Register Now</Link></p>
                                    <button type="submit" className="mt-4 btn btn-primary btn-block" disabled={isSubmitting}>
                                        {isSubmitting ? 'Logging in...' : 'Login'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdvocateLogin;