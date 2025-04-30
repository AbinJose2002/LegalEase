import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Client = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientDetails, setClientDetails] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseForm, setCaseForm] = useState({
    caseNumber: '',
    caseType: ''
  });
  const [processingCaseId, setProcessingCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);

  // Case type options for the form
  const caseTypes = [
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'civil', label: 'Civil Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'business', label: 'Business Law' },
    { value: 'property', label: 'Property Law' },
    { value: 'other', label: 'Other' }
  ];

  // Handle expanding/collapsing a case details view
  const handleExpandCase = async (caseId) => {
    try {
      // If the case is already selected, collapse it
      if (selectedCaseId === caseId) {
        setSelectedCaseId(null);
        setSelectedCaseDetails(null);
        setCaseForm({
          caseNumber: '',
          caseType: ''
        });
        return;
      }
      
      // Set the selected case ID
      setSelectedCaseId(caseId);
      
      // Reset the form
      setCaseForm({
        caseNumber: '',
        caseType: ''
      });

      // Find the case details from existing data
      const caseDetails = clientDetails.find(client => client._id === caseId);
      
      if (caseDetails) {
        console.log("Found case details in existing data:", caseDetails);
        setSelectedCaseDetails(caseDetails);
      } else {
        // If not found in existing data, fetch detailed information
        setLoading(true);
        const advToken = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
        
        if (!advToken) {
          console.warn("No advocate token found");
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }
        
        try {
          const response = await axios.get(`http://localhost:8080/api/case/${caseId}`, {
            headers: { Authorization: `Bearer ${advToken}` }
          });
          
          console.log("Case detail response:", response.data);
          
          if (response.data && response.data.success) {
            setSelectedCaseDetails(response.data.data);
          } else {
            setError("Failed to fetch case details");
          }
        } catch (detailError) {
          console.error("Error fetching case details:", detailError);
          setError("Could not load case details");
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in handleExpandCase:", error);
      setError("An error occurred while processing your request");
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCaseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle case confirmation
  const handleConfirmCase = async (caseId) => {
    if (!caseForm.caseNumber) {
      alert("Please enter a valid case number");
      return;
    }
    if (!caseForm.caseType) {
      alert("Please select a case type");
      return;
    }

    try {
      setProcessingCaseId(caseId);
      
      const res = await axios.post('http://localhost:8080/api/case/confirm', {
        caseNum: caseId,
        case_id: `CASE${caseForm.caseNumber}`,
        caseType: caseForm.caseType
      });

      if (res.data.success === "true") {
        // Update the local state
        const updatedClients = clientDetails.map(client => 
          client._id === caseId 
            ? { ...client, status: 'Open', case_id: `CASE${caseForm.caseNumber}`, caseType: caseForm.caseType } 
            : client
        );
        setClientDetails(updatedClients);
        
        // Reset selection and form
        setSelectedCaseId(null);
        setSelectedCaseDetails(null);
        setCaseForm({
          caseNumber: '',
          caseType: ''
        });
        
        // Show notification
        alert("Case confirmed successfully");
      } else {
        throw new Error(res.data.message || "Failed to confirm case");
      }
    } catch (error) {
      console.error("Case confirmation error:", error);
      alert(error.response?.data?.message || "Error confirming case");
    } finally {
      setProcessingCaseId(null);
    }
  };

  // Handle case rejection
  const handleRejectCase = async (caseId) => {
    if (!window.confirm("Are you sure you want to reject this case? This action cannot be undone.")) {
      return;
    }
    
    try {
      setProcessingCaseId(caseId);
      
      const res = await axios.post('http://localhost:8080/api/case/reject', { caseNum: caseId });
      
      if (res.data.success === "true") {
        // Remove the case from the list
        setClientDetails(prev => prev.filter(client => client._id !== caseId));
        setSelectedCaseId(null);
        setSelectedCaseDetails(null);
        alert("Case rejected successfully");
      } else {
        throw new Error("Failed to reject case");
      }
    } catch (error) {
      console.error("Error rejecting case:", error);
      alert("Error rejecting case");
    } finally {
      setProcessingCaseId(null);
    }
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        
        // Get the advocate token from local storage - check both formats
        const advToken = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');

        if (!advToken) {
          console.warn("No advocate token found");
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }
        
        // Use the backend endpoint that specifically filters by advocate ID
        console.log("Fetching case requests for currently logged-in advocate");
        const response = await axios.post(
          'http://localhost:8080/api/case/fetch', 
          { advToken },
          { headers: { Authorization: `Bearer ${advToken}` }}
        );
        
        console.log("Case data response:", response.data);

        // Check if the response contains the expected data
        if (response.data.success === "true") {
          // Filter to only show "Not Approved" cases (case requests)
          const advocateCases = response.data.clients || [];
          const pendingCases = advocateCases.filter(client => client.status === 'Not Approved');
          console.log(`Found ${pendingCases.length} pending case requests out of ${advocateCases.length} total cases`);
          setClientDetails(pendingCases);
        } else {
          console.warn("Unexpected response format:", response.data);
          setError("Received unexpected data format from server");
        }
      } catch (err) {
        console.error("Error fetching case data:", err);
        setError("Could not load your cases. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Case Requests</h2>
      
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading case requests...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : clientDetails.length === 0 ? (
        <div className="alert alert-info">You don't have any pending case requests.</div>
      ) : (
        <>
          {!selectedCaseId ? (
            // Show the list of cases when no case is selected
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Case Title</th>
                    <th>Client</th>
                    <th>Submitted On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientDetails.map((client) => (
                    <tr key={client._id}>
                      <td>{client.case_title}</td>
                      <td>
                        {client.userDetails ? 
                          `${client.userDetails.firstName} ${client.userDetails.lastName}` : 
                          'Unknown Client'}
                      </td>
                      <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleExpandCase(client._id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Show detailed case view when a case is selected
            <div className="case-details-container">
              {selectedCaseDetails ? (
                <div className="card">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Case Details</h5>
                    <button 
                      className="btn btn-sm btn-light"
                      onClick={() => {
                        setSelectedCaseId(null);
                        setSelectedCaseDetails(null);
                      }}
                    >
                      Back to Cases
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-4">
                          <h6 className="text-muted mb-1">Case Title</h6>
                          <p className="fw-bold">{selectedCaseDetails.case_title}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h6 className="text-muted mb-1">Description</h6>
                          <p>{selectedCaseDetails.case_description}</p>
                        </div>
                        
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <h6 className="text-muted mb-1">Status</h6>
                            <span className={`badge ${
                              selectedCaseDetails.status === 'Open' ? 'bg-success' : 
                              selectedCaseDetails.status === 'Closed' ? 'bg-danger' : 
                              'bg-warning'
                            }`}>
                              {selectedCaseDetails.status}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <h6 className="text-muted mb-1">Submitted On</h6>
                            <p>{new Date(selectedCaseDetails.createdAt || selectedCaseDetails.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-header bg-info text-white">
                            <h5 className="mb-0">Client Information</h5>
                          </div>
                          <div className="card-body">
                            {selectedCaseDetails.userDetails ? (
                              <>
                                <p><strong>Name:</strong> {selectedCaseDetails.userDetails.firstName} {selectedCaseDetails.userDetails.lastName}</p>
                                <p><strong>Email:</strong> {selectedCaseDetails.userDetails.email}</p>
                                <p><strong>Phone:</strong> {selectedCaseDetails.userDetails.phone || 'N/A'}</p>
                              </>
                            ) : (
                              <p>Client ID: {selectedCaseDetails.client_id}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedCaseDetails.status === 'Not Approved' && (
                      <div className="card mt-4">
                        <div className="card-header bg-success text-white">
                          <h5 className="mb-0">Case Approval</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="caseType" className="form-label">Case Type</label>
                              <select 
                                className="form-select"
                                name="caseType"
                                id="caseType"
                                value={caseForm.caseType}
                                onChange={handleFormChange}
                                required
                              >
                                <option value="">Select case type...</option>
                                {caseTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="caseNumber" className="form-label">Case Number</label>
                              <div className="input-group">
                                <span className="input-group-text">CASE</span>
                                <input 
                                  type="text"
                                  className="form-control"
                                  name="caseNumber"
                                  id="caseNumber"
                                  value={caseForm.caseNumber}
                                  onChange={handleFormChange}
                                  placeholder="e.g. 20230001"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleRejectCase(selectedCaseId)}
                              disabled={processingCaseId === selectedCaseId}
                            >
                              {processingCaseId === selectedCaseId ? 'Processing...' : 'Reject Case'}
                            </button>
                            <button 
                              className="btn btn-success"
                              onClick={() => handleConfirmCase(selectedCaseId)}
                              disabled={!caseForm.caseNumber || !caseForm.caseType || processingCaseId === selectedCaseId}
                            >
                              {processingCaseId === selectedCaseId ? 'Processing...' : 'Approve Case'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading case details...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Client;