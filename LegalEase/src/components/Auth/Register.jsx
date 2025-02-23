// src/components/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import Navbar from '../Navbar/Navbar'
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [firstName, setFirstName] = useState('')
    const [secondName, setSecondName] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Simple validation
        if (!firstName || !secondName || !email || !password || !phone) {
            setError('Please fill in all fields');
            return;
        }
        // Here you would typically send a request to your backend
        const registerData = {
            firstName,
            secondName,
            email,
            password,
            phone
        }
        console.log(registerData)
        try {
            setError('');
            const response = await axios.post("http://localhost:8080/api/user/register", registerData)
            if (response.data.success) {
                console.log(response.data.token)
                navigate('/login')
            }
        } catch (error) {
            console.log(`Error in register ${error}`)
        }
        // Reset fields
        setFirstName('');
        setSecondName('');
        setEmail('');
        setPassword('');
        setPhone('');
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 col-lg-6 col-sm-12">
                <h2>Register</h2>
                {error && <div className="alert alert-danger">{error}</div>}
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
                        <label>Second Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={secondName}
                            onChange={(e) => setSecondName(e.target.value)}
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
                            type="phone"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <p>Already User? <Link to='/register'>Login Now</Link></p>
                    <button type="submit" className="mt-4 btn btn-primary btn-block">
                        Register
                    </button>
                </form>
            </div>
        </>
    );
};

export default Register;