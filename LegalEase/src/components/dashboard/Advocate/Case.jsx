import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Case = ({ caseData, onStatusChange, advocateId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [advocateCases, setAdvocateCases] = useState([]);
    const [fetchingCases, setFetchingCases] = useState(false);
    const [clientDetails, setClientDetails] = useState(null);
    const [fetchingClient, setFetchingClient] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (caseData && caseData._id) {
            fetchDocuments(caseData._id);
            
            // Fetch client details if we have a client_id
            if (caseData.client_id) {
                fetchClientDetails(caseData.client_id);
            }
        }
        
        // Fetch all cases for the logged in advocate
        if (advocateId) {
            fetchAdvocateCases();
        }
    }, [caseData, advocateId]);

    // New function to fetch client details
    const fetchClientDetails = async (clientId) => {
        try {
            setFetchingClient(true);
            const token = localStorage.getItem('advtoken');
            
            if (!token) {
                console.error("No advocate token found");
                return;
            }
            
            // Call the API to get client details
            const response = await axios.get(`http://localhost:8080/api/user/${clientId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                }
            });
            
            console.log("Client details response:", response.data);
            
            if (response.data && response.data.success) {
                setClientDetails(response.data.data);
            } else {
                console.warn("Could not fetch client details", response.data);
            }
        } catch (err) {
            console.error("Error fetching client details:", err);
        } finally {
            setFetchingClient(false);
        }
    };

    const fetchAdvocateCases = async () => {
        try {
            setFetchingCases(true);
            const token = localStorage.getItem('advtoken');
            const storedAdvocateId = localStorage.getItem('advocateId');
            
            // Log the advocate IDs to help diagnose the issue
            console.log("Component advocateId prop:", advocateId);
            console.log("Stored advocateId from localStorage:", storedAdvocateId);
            
            // Use the most reliable ID (prop first, then localStorage)
            const effectiveAdvocateId = advocateId || storedAdvocateId;
            
            if (!token) {
                console.error("No advocate token found");
                setError("Authentication required");
                setFetchingCases(false);
                return;
            }
            
            if (!effectiveAdvocateId) {
                console.error("No advocate ID available");
                setError("Advocate ID is required");
                setFetchingCases(false);
                return;
            }
            
            console.log(`Fetching cases specifically for advocate ID: ${effectiveAdvocateId}`);
            
            // Use the endpoint that you have confirmed is working
            const response = await axios.post(
                'http://localhost:8080/api/case/fetch', 
                { advToken: token },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            console.log("Case data response:", response.data);
            
            if (response.data.success === "true") {
                // If response has nested client data
                const advocateCases = response.data.clients || [];
                console.log(`Found ${advocateCases.length} cases for advocate ${effectiveAdvocateId}`);
                setAdvocateCases(advocateCases);
                setError(null);
            } else {
                console.warn("API returned success:false", response.data);
                setError(response.data?.message || "Failed to fetch cases");
            }
        } catch (err) {
            console.error("Error fetching advocate cases:", err);
            setError("Could not load your cases");
        } finally {
            setFetchingCases(false);
        }
    };

    const fetchDocuments = async (caseId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/documents/${caseId}`);
            
            if (response.data && response.data.documents) {
                setDocuments(response.data.documents);
            }
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError("Could not load documents for this case");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('caseId', caseData._id);
        formData.append('name', file.name);

        try {
            setIsUploading(true);
            setUploadProgress(0);
            
            const response = await axios.post(
                'http://localhost:8080/api/documents/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );
            
            if (response.data && response.data.success) {
                alert('Document uploaded successfully');
                fetchDocuments(caseData._id);
            }
        } catch (err) {
            console.error("Error uploading document:", err);
            setError("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseCase = async () => {
        if (!window.confirm("Are you sure you want to close this case?")) {
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8080/api/case/close',
                { caseId: caseData._id }
            );
            
            if (response.data && response.data.success) {
                alert('Case closed successfully');
                if (onStatusChange) {
                    onStatusChange(caseData._id, 'Closed');
                }
                // Refresh the list of cases
                fetchAdvocateCases();
            }
        } catch (err) {
            console.error("Error closing case:", err);
            setError("Failed to close case. Please try again.");
        }
    };

    const handleViewCase = async (caseId, status) => {
        console.log(`Case status change requested: ${caseId}, ${status}`);
        
        if (status === 'Select') {
            // If case is selected, find it in the advocate cases array
            try {
                const selectedCase = advocateCases.find(c => c._id === caseId);
                console.log("Found case in local data:", selectedCase);
                
                if (selectedCase) {
                    // Use the onStatusChange prop from parent component
                    if (onStatusChange) {
                        onStatusChange(selectedCase);
                    }
                } else {
                    // If not found, fetch from API
                    const token = localStorage.getItem('advtoken');
                    const response = await axios.get(
                        `http://localhost:8080/api/case/${caseId}`,
                        { headers: { Authorization: `Bearer ${token}` }}
                    );
                    
                    if (response.data && response.data.data) {
                        onStatusChange(response.data.data);
                    } else {
                        setError("Could not load case details");
                    }
                }
            } catch (error) {
                console.error("Error selecting case:", error);
                setError("Error loading case details");
            }
        } else if (status === 'Back') {
            // Go back to case list
            if (onStatusChange) {
                onStatusChange(null, 'Back');
            }
        }
    };

    // Render the all cases list if no specific case is selected
    if (!caseData) {
        return (
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Your Cases</h5>
                </div>
                <div className="card-body">
                    {fetchingCases ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading your cases...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : advocateCases.length === 0 ? (
                        <div className="alert alert-info">You don't have any cases yet.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Case ID</th>
                                        <th>Title</th>
                                        <th>Client</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {advocateCases.map(caseItem => (
                                        <tr key={caseItem._id}>
                                            <td>{caseItem.case_id || 'Pending'}</td>
                                            <td>{caseItem.case_title}</td>
                                            <td>
                                                {caseItem.userDetails ? 
                                                    `${caseItem.userDetails.firstName} ${caseItem.userDetails.lastName}` : 
                                                    'Unknown Client'}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    caseItem.status === 'Open' ? 'bg-success' : 
                                                    caseItem.status === 'Closed' ? 'bg-danger' : 
                                                    'bg-warning'
                                                }`}>
                                                    {caseItem.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleViewCase(caseItem._id, 'Select')}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular case details view when a specific case is selected
    return (
        <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Case Details</h5>
                <div>
                    <button 
                        className="btn btn-sm btn-light me-2"
                        onClick={() => handleViewCase(null, 'Back')}
                    >
                        Back to All Cases
                    </button>
                    <span className={`badge ${
                        caseData.status === 'Open' ? 'bg-success' : 
                        caseData.status === 'Closed' ? 'bg-danger' : 
                        'bg-warning'
                    }`}>
                        {caseData.status}
                    </span>
                </div>
            </div>
            <div className="card-body">
                <div className="row mb-4">
                    <div className="col-md-6">
                        <h6>Case ID:</h6>
                        <p>{caseData.case_id || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6>Filed On:</h6>
                        <p>{new Date(caseData.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <h6>Case Title:</h6>
                    <p>{caseData.case_title}</p>
                </div>

                <div className="mb-4">
                    <h6>Description:</h6>
                    <p>{caseData.case_description}</p>
                </div>

                <div className="mb-4">
                    <h6>Status:</h6>
                    <p>{caseData.status}</p>
                    {caseData.status === 'Closed' && caseData.updated_at && (
                        <p className="text-muted">
                            Closed on: {new Date(caseData.updated_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <h6>Client Information:</h6>
                    {fetchingClient ? (
                        <p>Loading client details...</p>
                    ) : clientDetails ? (
                        <div>
                            <p><strong>Name:</strong> {clientDetails.firstName} {clientDetails.lastName}</p>
                            <p><strong>Email:</strong> {clientDetails.email}</p>
                            <p><strong>Phone:</strong> {clientDetails.phone || 'N/A'}</p>
                        </div>
                    ) : caseData.userDetails ? (
                        <div>
                            <p>Name: {caseData.userDetails.firstName} {caseData.userDetails.lastName}</p>
                            <p>Email: {caseData.userDetails.email}</p>
                            <p>Phone: {caseData.userDetails.phone || 'N/A'}</p>
                        </div>
                    ) : (
                        <p>Client ID: {caseData.client_id}</p>
                    )}
                </div>

                <div className="mb-4">
                    <h6>Case Documents:</h6>
                    {loading ? (
                        <p>Loading documents...</p>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : documents.length > 0 ? (
                        <div className="list-group">
                            {documents.map(doc => (
                                <a 
                                    key={doc._id} 
                                    href={`http://localhost:8080/uploads/${doc.file}`} 
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <span>{doc.name || doc.file}</span>
                                    <small>{new Date(doc.createdAt).toLocaleDateString()}</small>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p>No documents available for this case</p>
                    )}

                    {caseData.status !== 'Closed' && (
                        <div className="mt-3">
                            {isUploading ? (
                                <div className="progress">
                                    <div 
                                        className="progress-bar" 
                                        role="progressbar" 
                                        style={{width: `${uploadProgress}%`}}
                                        aria-valuenow={uploadProgress} 
                                        aria-valuemin="0" 
                                        aria-valuemax="100"
                                    >
                                        {uploadProgress}%
                                    </div>
                                </div>
                            ) : (
                                <div className="custom-file">
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="documentUpload" 
                                        onChange={handleFileUpload} 
                                    />
                                    <label className="form-label" htmlFor="documentUpload">
                                        Upload Document
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {caseData.status !== 'Closed' && (
                    <div className="d-flex justify-content-end">
                        <button 
                            className="btn btn-danger"
                            onClick={handleCloseCase}
                        >
                            Close Case
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Case;
