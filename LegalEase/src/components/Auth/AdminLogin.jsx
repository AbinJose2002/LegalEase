import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ 
        name: '',
        email: '', 
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const response = await axios.post(`http://localhost:8080/api/admin${endpoint}`, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (isLogin) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
                navigate('/admin/dashboard');
            } else {
                setIsLogin(true);
                setError('Registration successful! Please login.');
                setFormData({ ...formData, password: '', confirmPassword: '' });
            }
        } catch (error) {
            setError(error.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-75">
            <div className="card shadow-lg" style={{width: '400px'}}>
                <div className="card-body p-5">
                    <h1 className="card-title text-center mb-4">
                        Admin {isLogin ? 'Login' : 'Registration'}
                    </h1>
                    {error && (
                        <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-danger'}`} role="alert">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="form-control mb-3"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required={!isLogin}
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email"
                                className="form-control mb-3"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-control mb-3"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            {!isLogin && (
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="form-control"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    required={!isLogin}
                                />
                            )}
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 mb-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Loading...
                                </span>
                            ) : (isLogin ? 'Login' : 'Register')}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                                }}
                            >
                                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
