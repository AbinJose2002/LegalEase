import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/animations.css';

export default function Profile() {
  const [advocate, setAdvocate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    address: ''
  });

  const renderSpecialization = (spec) => {
    if (Array.isArray(spec)) {
      return spec.map(item => item.label || item.value || item).join(', ');
    }
    return spec || 'Not specified';
  };

  useEffect(() => {
    fetchAdvocateDetails();
    fetchPaymentStats();
  }, []);

  const fetchAdvocateDetails = async () => {
    try {
      const token = localStorage.getItem('advocatetoken');
      const response = await axios.post('http://localhost:8080/api/advocate/get-profile', 
        { token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success === "true") {
        setAdvocate(response.data.advocate);
        setEditForm(response.data.advocate);
      }
      setLoading(false);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to fetch advocate details');
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('advocatetoken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/api/payment/advocate-earnings',
        { token },
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success === "true") {
        setTotalEarnings(response.data.totalEarnings || 0);
        // Optional: Add more detailed payment info if needed
      } else {
        setError('Failed to fetch earnings data');
      }
    } catch (err) {
      console.error('Payment stats error:', err);
      setError(err.response?.data?.message || 'Failed to fetch payment statistics');
      setTotalEarnings(0); // Set default value on error
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('advocatetoken');
      // Convert specialization string back to array of objects
      const updatedForm = {
        ...editForm,
        specialization: editForm.specialization.split(',').map(s => ({
          label: s.trim(),
          value: s.trim()
        }))
      };

      const response = await axios.post('http://localhost:8080/api/advocate/update-profile', 
        {
          ...updatedForm,
          token
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success === "true") {
        setAdvocate(updatedForm);
        setIsEditing(false);
        alert('Profile updated successfully');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4 fade-in">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card card-animation">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" 
                   style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                {advocate?.firstName?.charAt(0)}
              </div>
              <h4 className="card-title">{`${advocate?.firstName} ${advocate?.lastName}`}</h4>
              <p className="text-muted">{renderSpecialization(advocate?.specialization)}</p>
              
              <div className="mt-4 glass-card p-3">
                <h5 className="text-gradient">Total Earnings</h5>
                <h3 className="mb-0">₹{totalEarnings}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card card-animation">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="card-title mb-0">Profile Details</h3>
                <button 
                  className="btn btn-primary btn-transition"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="slide-in-right">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        className="form-control"
                        value={Array.isArray(editForm.specialization) ? 
                          editForm.specialization.map(s => s.label || s.value || s).join(', ') : 
                          editForm.specialization || ''
                        }
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          specialization: e.target.value
                        })}
                        placeholder="Enter specializations separated by commas"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Experience</label>
                      <div className="input-group">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="form-control"
                          value={editForm.experience || ''}
                          onChange={(e) => setEditForm({...editForm, experience: Number(e.target.value)})}
                        />
                        <span className="input-group-text">years</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-success btn-transition">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="scale-in">
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Email:</strong></div>
                    <div className="col-sm-9">{advocate?.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Phone:</strong></div>
                    <div className="col-sm-9">{advocate?.phone}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Specialization:</strong></div>
                    <div className="col-sm-9">{renderSpecialization(advocate?.specialization)}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Experience:</strong></div>
                    <div className="col-sm-9">
                      {advocate?.experience ? `${advocate.experience} years` : 'Not specified'}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3"><strong>Address:</strong></div>
                    <div className="col-sm-9">{advocate?.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
