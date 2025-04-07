// src/components/Register.js
import React, { useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import '../../styles/animations.css';

const AdvocateRegister = () => {
    const options = [
        { label: "Criminal", value: "criminal" },
        { label: "Civil", value: "civil" },
        { label: "Business", value: "business" },
        { label: "Family", value: "family" },
        { label: "Real Estate", value: "real_estate" },
        { label: "Immigration", value: "immigration" },
        { label: "Personal Injury", value: "personal_injury" },
        { label: "Corporate", value: "corporate" },
        { label: "Employment", value: "employment" },
        { label: "Intellectual Property", value: "intellectual_property" }
    ];
    
    const [selected, setSelected] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [advanceFee, setAdvanceFee] = useState('');
    const [sittingFee, setSittingFee] = useState('');
    const [experience, setExperience] = useState('0');
    const [consultationFee, setConsultationFee] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !email || !password || !phone || !advanceFee || !sittingFee || !experience) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('bio', bio);
        formData.append('advanceFee', advanceFee);
        formData.append('sittingFee', sittingFee);
        formData.append('image', image);
        formData.append('experience', experience);
        formData.append('consultationFee', consultationFee || advanceFee);
        formData.append('specialization', JSON.stringify(selected));

        try {
            const response = await axios.post(
                "http://localhost:8080/api/advocate/register", 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data.success) {
                alert('Registration successful! Please wait for admin approval.');
                navigate('/advocate-login');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.response?.data?.message || 'Registration failed');
        }

        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setBio('');
        setAdvanceFee('');
        setSittingFee('');
        setSelected([]);
        setImage('');
        setExperience('0');
        setConsultationFee('');
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 col-lg-6 col-sm-12 fade-in">
                <h2 className="mb-4 scale-in">Register as Advocate</h2>
                <form onSubmit={handleSubmit} className="card card-transition p-4 shadow-sm">
                    <div className="row">
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.1s' }}>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.2s' }}>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.3s' }}>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.4s' }}>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.5s' }}>
                            <div className="form-group">
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.6s' }}>
                            <div className="form-group">
                                <label>Specialization:</label>
                                <MultiSelect
                                    options={options}
                                    value={selected}
                                    onChange={setSelected}
                                    labelledBy="Select"
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.65s' }}>
                            <div className="form-group">
                                <label>Years of Experience:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-12 scale-in" style={{ animationDelay: '0.7s' }}>
                            <div className="form-group">
                                <label>Bio:</label>
                                <textarea
                                    className="form-control"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.8s' }}>
                            <div className="form-group">
                                <label>Advance Fee:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={advanceFee}
                                    onChange={(e) => setAdvanceFee(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.9s' }}>
                            <div className="form-group">
                                <label>Sitting Fee:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={sittingFee}
                                    onChange={(e) => setSittingFee(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 scale-in" style={{ animationDelay: '0.95s' }}>
                            <div className="form-group">
                                <label>Consultation Fee:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={consultationFee}
                                    onChange={(e) => setConsultationFee(e.target.value)}
                                    placeholder="If different from advance fee"
                                />
                            </div>
                        </div>
                        <div className="col-md-12 scale-in" style={{ animationDelay: '1s' }}>
                            <div className="form-group">
                                <label>Profile Image:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <p>Already a User? <Link to='/register'>Login Now</Link></p>
                    <button type="submit" className="mt-4 btn btn-primary btn-block btn-transition">
                        Register
                    </button>
                </form>
            </div>
        </>
    );
};

export default AdvocateRegister;
