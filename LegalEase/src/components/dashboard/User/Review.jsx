import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export default function Review() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState('');
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await axios.post(
                'http://localhost:8080/api/case/user-cases', 
                { token },
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );

            if (response.data.success === "true") {
                setCases(response.data.cases);
            } else {
                throw new Error(response.data.message || 'Failed to fetch cases');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching cases:', err);
            setError(err.response?.data?.message || 'Failed to fetch cases');
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('usertoken');
            await axios.post('http://localhost:8080/api/review/submit', {
                caseId: selectedCase,
                rating,
                review,
                token
            });
            alert('Review submitted successfully');
            setSelectedCase('');
            setRating(0);
            setReview('');
        } catch (err) {
            alert('Failed to submit review');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container fade-in">
            <h2 className="mb-4">Review Your Advocate</h2>
            
            {cases.length === 0 ? (
                <div className="alert alert-info">
                    No closed cases available for review
                </div>
            ) : (
                <form onSubmit={handleSubmitReview} className="card p-4 shadow-sm">
                    <div className="mb-3">
                        <label className="form-label">Select Case</label>
                        <select 
                            className="form-select"
                            value={selectedCase}
                            onChange={(e) => setSelectedCase(e.target.value)}
                            required
                        >
                            <option value="">Choose a case...</option>
                            {cases.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.case_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Rating</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesomeIcon
                                    key={star}
                                    icon={faStar}
                                    className={`star ${star <= rating ? 'text-warning' : 'text-muted'}`}
                                    style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '5px' }}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Your Review</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            required
                            placeholder="Share your experience with the advocate..."
                        ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Submit Review
                    </button>
                </form>
            )}
        </div>
    );
}
