import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Document = () => {
    const [cases, setCases] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('userToken');
            
            console.log("Fetching cases with userId:", userId);
            
            if (!userId) {
                console.error("No userId found in localStorage");
                setError("User ID not found. Please log in again.");
                return;
            }
            
            // Pass the userId directly in the URL query parameter
            const response = await axios.get(`http://localhost:8080/api/case/user/cases?userId=${userId}`, {
                headers: {
                    // Also send the auth token if available
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'x-user-id': userId
                }
            });
            
            console.log("Cases API response:", response.data);
            
            if (response.data.success) {
                setCases(response.data.data || []);
            } else {
                console.warn("API returned success:false", response.data);
                setCases([]);
                setError(response.data.message || "Failed to fetch cases");
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            setCases([]);
            setError("Unable to load your cases. Please try again later.");
        }
    };

    return (
        <div>
            <h1>Your Cases</h1>
            {error && <p className="error">{error}</p>}
            <ul>
                {cases.map((caseItem) => (
                    <li key={caseItem._id}>{caseItem.case_title}</li>
                ))}
            </ul>
        </div>
    );
};

export default Document;