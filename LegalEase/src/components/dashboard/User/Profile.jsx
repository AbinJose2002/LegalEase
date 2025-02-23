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
        <div className="container mt-5">
            <div className="card shadow-sm p-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="mb-4 text-center">Edit Profile</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="[0-9]{10}"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className="form-control"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                        />
                        <div className="form-text">Required for password changes</div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-control"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            minLength="8"
                        />
                        <div className="form-text">Minimum 8 characters</div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;