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
            // Get user ID and token from localStorage
            const token = localStorage.getItem('userToken');
            const userId = localStorage.getItem('userId') || localStorage.getItem('usertoken');
            
            console.log("Fetching cases with:", { 
                hasToken: !!token, 
                tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
                userId: userId || 'none'
            });
            
            let response;
            
            if (token) {
                // Primary approach: Use auth header with token
                response = await axios.get('http://localhost:8080/api/case/user/cases', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-user-id': userId || '' // Backup user ID in header
                    }
                });
            } else if (userId) {
                // Fallback: Use explicit user ID in URL if token isn't available
                response = await axios.get(`http://localhost:8080/api/case/user/${userId}/cases`);
            } else {
                throw new Error('User authentication information not found');
            }
            
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
            
            // More detailed error logging
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received, request was:", error.request);
            }
            
            setCases([]);
            // User-friendly error message
            setError(error.message || "Unable to load your cases. Please try again later.");
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