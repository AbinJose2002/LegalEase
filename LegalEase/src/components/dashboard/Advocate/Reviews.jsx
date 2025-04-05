import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/animations.css';

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('advocatetoken');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                console.log('Fetching reviews for advocate:', decodedToken.id);

                const response = await axios.get(
                    `http://localhost:8080/api/review/advocate/${decodedToken.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data.success === "true") {
                    setReviews(response.data.reviews);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (err) {
                console.error('Review fetch error:', err);
                setError(err.response?.data?.message || 'Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FontAwesomeIcon
                key={index}
                icon={solidStar}
                className={index < rating ? 'text-warning' : 'text-muted'}
            />
        ));
    };

    if (loading) return <div>Loading reviews...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container py-4 fade-in">
            <h2 className="mb-4">My Reviews</h2>
            
            {reviews.length === 0 ? (
                <div className="alert alert-info">No reviews yet</div>
            ) : (
                <div className="row">
                    {reviews.map((review, index) => (
                        <div key={review._id} className="col-md-6 mb-4">
                            <div className="card shadow-sm hover-lift">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="card-title mb-0">
                                            Case: {review.caseId.case_title}
                                        </h5>
                                        <div className="text-warning">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <p className="card-text">{review.review}</p>
                                    <div className="text-muted">
                                        <small>
                                            Client: {review.clientId.firstName} {review.clientId.lastName}
                                        </small>
                                        <br />
                                        <small>
                                            Date: {new Date(review.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
