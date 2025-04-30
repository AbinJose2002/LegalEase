import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Client = () => {
    const { caseId } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClientDetails();
    }, [caseId]);

    const fetchClientDetails = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Extract caseId from URL params or props
            const caseId = params.id || props.caseId;
            
            console.log("Fetching case data for ID:", caseId);
            
            // Check if caseId exists first
            if (!caseId) {
                setError("Case ID is missing. Please select a valid case.");
                setIsLoading(false);
                return;
            }
            
            // Get the user token
            const token = localStorage.getItem('userToken') || localStorage.getItem('usertoken');
            
            // Make the request to the backend using GET endpoint instead of POST
            const response = await axios.get(`http://localhost:8080/api/case/${caseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-user-id': localStorage.getItem('userId') || ''
                }
            });
            
            console.log("Case data response:", response.data);
            
            if (response.data && response.data.success) {
                setCaseData(response.data.data);
            } else {
                console.warn("API returned success:false", response.data);
                setError(response.data?.message || "Failed to fetch case data");
            }
        } catch (error) {
            console.error("Error fetching case data:", error);
            
            // Provide a user-friendly error message based on the status code
            if (error.response) {
                if (error.response.status === 404) {
                    setError("The requested case could not be found.");
                } else if (error.response.status === 400) {
                    setError("Invalid request. Please ensure the case ID is correct.");
                } else if (error.response.status === 500) {
                    setError("There was a server error. Please try again later.");
                } else {
                    setError(error.response.data?.message || "An error occurred while fetching case data");
                }
            } else {
                setError("Network error. Please check your connection and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Add a better error display in the render method
    return (
        <div className="container mt-4">
            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading case details...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-outline-danger" onClick={fetchClientDetails}>
                        Try Again
                    </button>
                </div>
            ) : (
                // ...existing case display code...
                <div>
                    <h2>Case Details</h2>
                    <p><strong>Case ID:</strong> {caseData.case_id}</p>
                    <p><strong>Title:</strong> {caseData.case_title}</p>
                    <p><strong>Description:</strong> {caseData.case_description}</p>
                    <p><strong>Status:</strong> {caseData.status}</p>
                    <p><strong>Created At:</strong> {new Date(caseData.createdAt).toLocaleString()}</p>
                    <p><strong>Updated At:</strong> {new Date(caseData.updatedAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default Client;