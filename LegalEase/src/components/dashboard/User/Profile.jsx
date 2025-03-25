import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [userId, setUserId] = useState('')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('usertoken');
        console.log(token)
        const fetchUserData = async () => {
            try {
                const response = await axios.post('http://localhost:8080/api/user/fetch', { token });
                console.log(response)
                const { password, ...userData } = response.data.data; // Remove password from response
                setFormData(userData);
                setUserId(response.data.data._id);
                setLoading(false);
            } catch (err) {
                console.log(err)
                setError('Failed to load user data');
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        console.log(userId)
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Create update payload
            const updateData = {
                userId: userId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
            };

            // Only add password fields if new password is provided
            if (formData.newPassword) {
                if (!formData.currentPassword) {
                    throw new Error('Current password is required to change password');
                }

                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }
            const response = await axios.post('http://localhost:8080/api/user/update', updateData);

            // Clear password fields after successful update
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: ''
            }));

            alert('Profile updated successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
        }
    };

    if (loading) return (
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    );

    return (
        <div className="container mt-5 fade-in">
            <div className="card shadow border-0 p-4" 
                style={{ 
                    maxWidth: '500px', 
                    margin: '0 auto',
                    transition: 'all 0.3s ease'
                }}>
                <div className="text-center mb-4">
                    <div className="avatar-placeholder mb-3">
                        <i className="fas fa-user-circle fa-4x text-primary opacity-75"></i>
                    </div>
                    <h2 className="fw-bold text-gradient">Edit Profile</h2>
                </div>
                
                {error && (
                    <div className="alert alert-danger slide-in-right">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="slide-in-bottom">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control hover-lift"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="First Name"
                                />
                                <label>First Name</label>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control hover-lift"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Last Name"
                                />
                                <label>Last Name</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            name="email"
                            className="form-control hover-lift"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Email address"
                        />
                        <label>Email address</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="tel"
                            name="phone"
                            className="form-control hover-lift"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="[0-9]{10}"
                            required
                            placeholder="Phone Number"
                        />
                        <label>Phone Number</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            name="currentPassword"
                            className="form-control hover-lift"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                        />
                        <label>Current Password</label>
                        <div className="form-text">Required for password changes</div>
                    </div>

                    <div className="form-floating mb-4">
                        <input
                            type="password"
                            name="newPassword"
                            className="form-control hover-lift"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            minLength="8"
                        />
                        <label>New Password</label>
                        <div className="form-text">Minimum 8 characters</div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-4 hover-lift"
                        style={{
                            transition: 'all 0.3s ease',
                            transform: 'translateY(0)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fas fa-save me-2"></i>
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;