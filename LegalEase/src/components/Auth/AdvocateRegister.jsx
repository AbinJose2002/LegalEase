// src/components/Register.js
import React, { useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

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
    const [formData, setFormData] = useState({})

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !email || !password || !phone || !advanceFee || !sittingFee) {
            alert('Please fill in all fields');
            return;
        }

        setFormData({
            firstName,
            lastName, 
            specialization: selected,
            email,
            password,
            phone,
            bio,
            advanceFee,
            sittingFee,
            image
        })
        console.log(formData)
        try {
            const response = await axios.post("http://localhost:8080/api/advocate/register", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                console.log(response.data.token); 
                navigate('/advocate-register-success');
            }
        } catch (error) {
            console.log(`Error in register: ${error}`);
        }

        // Reset form fields
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
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 col-lg-6 col-sm-12">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
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
                    <div className="form-group">
                        <label>Specialization:</label>
                        <MultiSelect
                            options={options}
                            value={selected}
                            onChange={setSelected}
                            labelledBy="Select"
                        />
                    </div>
                    <div className="form-group">
                        <label>Bio:</label>
                        <textarea
                            className="form-control"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                    </div>
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
                    <div className="form-group">
                        <label>Profile Image:</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {setImage(e.target.files[0])
                            }}
                        />
                    </div>
                    <p>Already a User? <Link to='/register'>Login Now</Link></p>
                    <button type="submit" className="mt-4 btn btn-primary btn-block">
                        Register
                    </button>
                </form>
            </div>
        </>
    );
};

export default AdvocateRegister;
