import React, { useState } from 'react';
import { registerAdvocate } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './AdvocateRegistration.css';

const AdvocateRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
    experience: '0', // Default to 0 years of experience
    advanceFee: '',
    sittingFee: '',
    consultationFee: '',
    specialization: [] // Array for multiple specializations
  });

  const specializationOptions = [
    { value: 'criminal', label: 'Criminal' },
    { value: 'civil', label: 'Civil' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'family', label: 'Family' },
    { value: 'property', label: 'Property' },
    { value: 'tax', label: 'Tax' },
    { value: 'immigration', label: 'Immigration' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevData => {
      if (checked) {
        return { ...prevData, specialization: [...prevData.specialization, value] };
      } else {
        return { 
          ...prevData, 
          specialization: prevData.specialization.filter(spec => spec !== value) 
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'password', 'experience', 'advanceFee', 
      'sittingFee', 'consultationFee'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0 || formData.specialization.length === 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')} ${formData.specialization.length === 0 ? 'and specialization' : ''}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData object for file upload
      const submissionData = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'specialization') {
          // Convert array to JSON string
          submissionData.append(key, JSON.stringify(formData[key].map(spec => ({
            label: specializationOptions.find(opt => opt.value === spec)?.label,
            value: spec
          }))));
        } else {
          submissionData.append(key, formData[key]);
        }
      });
      
      // Explicitly append the experience field to ensure it's included
      submissionData.append('experience', formData.experience);
      
      // Append profile image if provided
      if (profileImage) {
        submissionData.append('image', profileImage);
      }

      console.log("Submitting form data:", Object.fromEntries(submissionData.entries()));
      
      const response = await registerAdvocate(submissionData);
      
      if (response.success) {
        // Handle successful registration
        alert('Registration successful! Please wait for admin approval.');
        navigate('/login'); // Redirect to login page
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="advocate-registration-container">
      <h2>Advocate Registration</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="bio">Professional Bio</label>
          <textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
          />
        </div>

        {/* Experience Field - Important! */}
        <div className="form-group full-width">
          <label htmlFor="experience">Years of Experience*</label>
          <input
            type="number"
            name="experience"
            id="experience"
            value={formData.experience}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="advanceFee">Advance Fee (₹)*</label>
            <input
              type="number"
              name="advanceFee"
              id="advanceFee"
              value={formData.advanceFee}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sittingFee">Sitting Fee (₹)*</label>
            <input
              type="number"
              name="sittingFee"
              id="sittingFee"
              value={formData.sittingFee}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="consultationFee">Consultation Fee (₹)*</label>
            <input
              type="number"
              name="consultationFee"
              id="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Specialization*</label>
          <div className="specialization-checkboxes">
            {specializationOptions.map((option) => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  name="specialization"
                  value={option.value}
                  onChange={handleSpecializationChange}
                  checked={formData.specialization.includes(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="image">Profile Image</label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Profile Preview" />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AdvocateRegistration;