import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFile, FaFileAlt, FaFileWord, FaFilePdf, FaFileExcel, FaFilePowerpoint, FaExclamationTriangle, FaSignInAlt, FaFolderOpen } from 'react-icons/fa';

const Documents = () => {
    const [cases, setCases] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [viewMode, setViewMode] = useState('cases'); // 'cases' or 'all'
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication first
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        // Look for authentication in multiple places
        const userToken = localStorage.getItem('userToken');
        const userId = localStorage.getItem('userId');
        const userTokenAlt = localStorage.getItem('usertoken');
        
        console.log("Auth check:", { 
            hasToken: !!userToken, 
            hasUserId: !!userId,
            hasAltToken: !!userTokenAlt
        });
        
        if (!userToken && !userId && !userTokenAlt) {
            setError("Please log in to view your documents");
            setLoading(false);
            setAuthChecked(true);
            return false;
        }
        
        // Authentication exists in some form
        setAuthChecked(true);
        fetchCases();
        fetchAllUserDocuments();
        return true;
    };

    const fetchCases = async () => {
        try {
            // Find all possible forms of authentication
            const userToken = localStorage.getItem('userToken');
            const userId = localStorage.getItem('userId');
            const userTokenAlt = localStorage.getItem('usertoken');
            
            // Use the first available ID
            const effectiveUserId = userId || userTokenAlt;
            
            console.log("Fetching cases with:", { 
                hasToken: !!userToken, 
                effectiveUserId: effectiveUserId || 'none'
            });
            
            if (!effectiveUserId && !userToken) {
                throw new Error("Authentication information not found");
            }
            
            // Construct request with all available auth methods
            const headers = {};
            if (userToken) {
                headers['Authorization'] = `Bearer ${userToken}`;
            }
            if (effectiveUserId) {
                headers['x-user-id'] = effectiveUserId;
            }
            
            // Send request with query parameter and headers
            const url = effectiveUserId 
                ? `http://localhost:8080/api/case/user/cases?userId=${effectiveUserId}`
                : 'http://localhost:8080/api/case/user/cases';
            
            const response = await axios.get(url, { headers });
            
            console.log("Cases API response:", response.data);
            
            if (response.data && response.data.success) {
                setCases(response.data.data || []);
            } else {
                console.warn("API returned success:false", response.data);
                setCases([]);
                setError(response.data?.message || "Failed to fetch cases");
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            
            if (error.message === "Authentication information not found") {
                setError("Please log in to view your documents");
            } else {
                setError("Unable to load your cases. Please try again later.");
            }
            
            setCases([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUserDocuments = async () => {
        try {
            // Get user token and ID
            const userToken = localStorage.getItem('userToken');
            const userId = localStorage.getItem('userId') || localStorage.getItem('usertoken');
            
            console.log("Fetching all user documents with:", {
                hasToken: !!userToken,
                userId: userId || 'none'
            });
            
            if (!userId && !userToken) {
                throw new Error("User authentication information not found");
            }
            
            // Define headers
            const headers = {};
            if (userToken) {
                headers['Authorization'] = `Bearer ${userToken}`;
            }
            if (userId) {
                headers['x-user-id'] = userId;
            }
            
            // Make the request using user endpoint
            const url = userId 
                ? `http://localhost:8080/api/documents/user?userId=${userId}`
                : 'http://localhost:8080/api/documents/user';
                
            const response = await axios.get(url, { headers });
            
            console.log("All user documents response:", response.data);
            
            if (response.data && response.data.success) {
                setAllDocuments(response.data.data || []);
            } else {
                console.warn("API returned success:false for documents", response.data);
                setAllDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching all user documents:", error);
            setAllDocuments([]);
        }
    };

    const fetchDocuments = async (caseId) => {
        if (!caseId) return;
        
        try {
            setLoading(true);
            
            // Try to get token if available
            const userToken = localStorage.getItem('userToken');
            const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};
            
            const response = await axios.get(`http://localhost:8080/api/documents/${caseId}`, { headers });
            
            console.log("Documents response:", response.data);
            
            if (response.data && response.data.documents) {
                // Map the documents to a consistent structure
                const normalizedDocuments = response.data.documents.map(doc => ({
                    _id: doc._id,
                    title: doc.name || doc.title || 'Document',
                    file: doc.fileUrl?.replace('/uploads/', '') || doc.file || '',
                    createdAt: doc.uploadedAt || doc.createdAt || new Date().toISOString()
                }));
                
                console.log("Normalized documents:", normalizedDocuments);
                setDocuments(normalizedDocuments);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCaseSelect = (caseItem) => {
        setSelectedCase(caseItem);
        fetchDocuments(caseItem._id);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        if (checkAuthentication()) {
            fetchCases();
            fetchAllUserDocuments();
        }
    };

    const getFileIcon = (filename) => {
        if (!filename) return <FaFile />;
        
        const extension = filename.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return <FaFilePdf />;
            case 'doc':
            case 'docx':
                return <FaFileWord />;
            case 'xls':
            case 'xlsx':
                return <FaFileExcel />;
            case 'ppt':
            case 'pptx':
                return <FaFilePowerpoint />;
            default:
                return <FaFileAlt />;
        }
    };

    const toggleViewMode = () => {
        setViewMode(prevMode => prevMode === 'cases' ? 'all' : 'cases');
        setSelectedCase(null);
    };

    // Authentication error state
    if (authChecked && error === "Please log in to view your documents") {
        return (
            <div className="container mt-5">
                <div className="card shadow-sm">
                    <div className="card-body text-center p-5">
                        <FaExclamationTriangle className="text-warning mb-3" size={50} />
                        <h3 className="mb-3">Authentication Required</h3>
                        <p className="text-muted mb-4">
                            Please log in to view your case documents and files.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                className="btn btn-primary" 
                                onClick={handleLogin}
                            >
                                <FaSignInAlt className="me-2" /> Go to Login
                            </button>
                            <button 
                                className="btn btn-outline-secondary" 
                                onClick={handleRetry}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading && cases.length === 0) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your documents...</p>
                </div>
            </div>
        );
    }

    // Generic error state
    if (error && cases.length === 0) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-outline-danger" onClick={handleRetry}>Try Again</button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!loading && cases.length === 0 && allDocuments.length === 0) {
        return (
            <div className="container mt-5">
                <div className="alert alert-info">
                    <h4 className="alert-heading">No Documents Found</h4>
                    <p>You don't have any cases or documents yet. Start a new case to see documents here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Your Documents</h2>
                <div className="btn-group">
                    <button 
                        className={`btn ${viewMode === 'cases' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('cases')}
                    >
                        By Cases
                    </button>
                    <button 
                        className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('all')}
                    >
                        All Documents
                    </button>
                </div>
            </div>
            
            {viewMode === 'cases' ? (
                <div className="row">
                    <div className="col-md-4">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Your Cases</h5>
                            </div>
                            <div className="list-group list-group-flush">
                                {Array.isArray(cases) && cases.map(caseItem => (
                                    <button
                                        key={caseItem._id}
                                        className={`list-group-item list-group-item-action ${selectedCase?._id === caseItem._id ? 'active' : ''}`}
                                        onClick={() => handleCaseSelect(caseItem)}
                                    >
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">{caseItem.case_title}</h6>
                                            <small className={`badge rounded-pill ${
                                                caseItem.status === 'Open' ? 'bg-success' : 
                                                caseItem.status === 'Closed' ? 'bg-danger' :
                                                'bg-warning'
                                            }`}>
                                                {caseItem.status}
                                            </small>
                                        </div>
                                        <small className="text-muted">Case ID: {caseItem.case_id}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-md-8">
                        {selectedCase ? (
                            <div className="card">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">{selectedCase.case_title} Documents</h5>
                                    <small>Case ID: {selectedCase.case_id}</small>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading documents...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {Array.isArray(documents) && documents.length > 0 ? (
                                                <div className="list-group">
                                                    {documents.map(doc => (
                                                        <a 
                                                            key={doc._id} 
                                                            href={`http://localhost:8080${doc.fileUrl || `/uploads/${doc.file}`}`} 
                                                            className="list-group-item list-group-item-action"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-3 fs-4">
                                                                    {getFileIcon(doc.fileUrl || doc.file || '')}
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-1">{doc.title || doc.name || doc.file || 'Document'}</h6>
                                                                    <small className="text-muted">
                                                                        Uploaded: {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="alert alert-light">
                                                    <p className="mb-0">No documents available for this case.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-body text-center p-5">
                                    <h5 className="text-muted mb-3">Select a case to view documents</h5>
                                    <p className="text-muted">Choose a case from the list on the left to view or upload documents related to that case.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">All Your Documents</h5>
                            </div>
                            <div className="card-body">
                                {allDocuments.length > 0 ? (
                                    <>
                                        {allDocuments.map((caseData, index) => (
                                            <div key={index} className="mb-4">
                                                <h5 className="border-bottom pb-2">
                                                    <FaFolderOpen className="me-2" />
                                                    {caseData.case.title}
                                                    <span className={`badge ms-2 ${
                                                        caseData.case.status === 'Open' ? 'bg-success' : 
                                                        caseData.case.status === 'Closed' ? 'bg-danger' :
                                                        'bg-warning'
                                                    }`}>
                                                        {caseData.case.status}
                                                    </span>
                                                </h5>
                                                <div className="list-group mb-3">
                                                    {caseData.documents.map(doc => (
                                                        <a 
                                                            key={doc._id} 
                                                            href={`http://localhost:8080/uploads/${doc.file}`} 
                                                            className="list-group-item list-group-item-action"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-3 fs-4">
                                                                    {getFileIcon(doc.file)}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1">{doc.title || doc.file}</h6>
                                                                    <small className="text-muted">
                                                                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                                                    </small>
                                                                </div>
                                                                <div>
                                                                    <span className="badge bg-light text-dark">
                                                                        Case ID: {caseData.case.caseId}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="alert alert-info">
                                        <p className="mb-0">No documents found across all your cases.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
