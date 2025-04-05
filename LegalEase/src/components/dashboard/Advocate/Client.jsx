import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/animations.css';

export default function Client() {
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestFilter, setRequestFilter] = useState('notApproved');
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [processingCaseId, setProcessingCaseId] = useState(null);
  
  // Form state for case approval
  const [caseForm, setCaseForm] = useState({
    caseNumber: '',
    caseType: ''
  });

  const caseTypes = [
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'civil', label: 'Civil Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'business', label: 'Business Law' },
    { value: 'property', label: 'Property Law' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const advToken = localStorage.getItem('advocatetoken');
        const response = await axios.post('http://localhost:8080/api/case/view', { advToken });
        setClientDetails(response.data.clients || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching case data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, []);

  // Handle reviewing a case (expand/collapse)
  const handleExpandCase = (caseId) => {
    if (expandedCaseId === caseId) {
      setExpandedCaseId(null);
      resetForm();
    } else {
      setExpandedCaseId(caseId);
      resetForm();
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

  // Reset form state
  const resetForm = () => {
    setCaseForm({
      caseNumber: '',
      caseType: ''
    });
    setProcessingCaseId(null);
  };

  // Handle case approval
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
        
        // Reset expanded state and form
        setExpandedCaseId(null);
        resetForm();
        
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
        setExpandedCaseId(null);
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

  // Filter cases based on selected filter
  const filteredClients = requestFilter === 'all' 
    ? clientDetails
    : requestFilter === 'notApproved'
      ? clientDetails.filter(client => client.status === 'Not Approved')
      : clientDetails.filter(client => client.status !== 'Not Approved');

  // Format relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'today';
      } else if (diffDays === 1) {
        return 'yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
      }
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Loading state
  if (loading && clientDetails.length === 0) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading case requests...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading case requests</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in case-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0 fw-bold scale-in">
          <i className="bi bi-briefcase me-2 text-primary"></i>
          Case Requests Management
        </h2>
        
        <div className="btn-group filter-controls shadow-sm">
          <button 
            className={`btn ${requestFilter === 'notApproved' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRequestFilter('notApproved')}
          >
            <i className="bi bi-hourglass-split me-1"></i> Pending
            <span className="badge bg-light text-dark ms-1">
              {clientDetails.filter(client => client.status === 'Not Approved').length}
            </span>
          </button>
          <button 
            className={`btn ${requestFilter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRequestFilter('approved')}
          >
            <i className="bi bi-check2-circle me-1"></i> Approved
          </button>
          <button 
            className={`btn ${requestFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRequestFilter('all')}
          >
            <i className="bi bi-list me-1"></i> All
          </button>
        </div>
      </div>
      
      {filteredClients.length === 0 ? (
        <div className="empty-state text-center p-5 bg-light rounded-3 shadow-sm">
          <img 
            src="/images/empty-case.svg" 
            alt="No cases" 
            className="mb-3"
            style={{ width: '120px', height: 'auto', opacity: 0.6 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <h4 className="text-muted mb-2">No Case Requests Found</h4>
          <p className="text-muted mb-0">
            {requestFilter === 'notApproved' ? 
              "You don't have any pending case requests to review at this time." :
              requestFilter === 'approved' ? 
              "You haven't approved any cases yet." :
              "There are no cases in the system yet."}
          </p>
        </div>
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4" style={{width: '5%'}}></th>
                  <th>Case Details</th>
                  <th>Client</th>
                  <th className="text-center">Status</th>
                  {/* <th className="text-center">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <React.Fragment key={client._id || index}>
                    <tr 
                      className={`table-row-animation ${expandedCaseId === client._id ? 'table-active' : ''}`}
                      onClick={() => handleExpandCase(client._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-center ps-4">
                        <i className={`bi ${expandedCaseId === client._id ? 'bi-chevron-down text-primary' : 'bi-chevron-right text-secondary'}`}></i>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold">{client.case_title}</span>
                          <div className="d-flex align-items-center mt-1">
                            <span className="badge rounded-pill bg-light text-dark border border-secondary me-2">
                              #{client.case_id || 'New'}
                            </span>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {getRelativeTime(client.created_at)}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {/* <div className="rounded-circle bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center me-2" 
                              style={{width: '32px', height: '32px'}}>
                            <i className="bi bi-person text-secondary"></i>
                          </div> */}
                          <div>
                            <div className="fw-medium">
                              {client.userDetails ? 
                                `${client.userDetails.firstName} ${client.userDetails.lastName}` : 
                                'Unknown Client'}
                            </div>
                            <small className="text-muted">
                              {client.userDetails?.phone || 'No contact info'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span 
                          className={`badge rounded-pill ${
                            client.status === 'Not Approved' ? 'bg-warning text-dark' : 
                            client.status === 'Open' ? 'bg-success' : 
                            client.status === 'Closed' ? 'bg-secondary' : 
                            'bg-info'
                          } px-3 py-2`}
                        >
                          <i className={`bi me-1 ${
                            client.status === 'Not Approved' ? 'bi-hourglass-split' : 
                            client.status === 'Open' ? 'bi-unlock' : 
                            client.status === 'Closed' ? 'bi-lock' : 
                            'bi-info-circle'
                          }`}></i>
                          {client.status}
                        </span>
                      </td>
                      
                    </tr>
                    
                    {/* Expanded case details section */}
                    {expandedCaseId === client._id && (
                      <tr className="form-slide-down">
                        <td colSpan="5" className="p-0">
                          <div className="case-details-expanded bg-light p-4">
                            <div className="card shadow-sm border-0">
                              <div className="card-body">
                                <div className="row mb-4">
                                  <div className="col-lg-7 border-end">
                                    <h5 className="card-title mb-4 d-flex align-items-center">
                                      <span className="badge rounded-pill bg-primary me-2">Case #{index + 1}</span>
                                      Case Review
                                    </h5>
                                    
                                    <div className="row g-4">
                                      <div className="col-md-6">
                                        <div className="detail-section">
                                          <h6 className="fw-bold text-uppercase text-primary small mb-3">
                                            <i className="bi bi-file-earmark-text me-2"></i>Case Details
                                          </h6>
                                          <div className="mb-3 ps-3 border-start border-2">
                                            <p className="fw-bold mb-1">{client.case_title}</p>
                                            <p className="text-muted mb-0 small">
                                              <span className="badge rounded-pill bg-light text-dark border me-1">
                                                #{client.case_id || 'New'}
                                              </span>
                                              •
                                              <i className="bi bi-calendar-date ms-1 me-1"></i>
                                              Submitted {new Date(client.created_at).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div className="card bg-white shadow-sm">
                                            <div className="card-body p-3">
                                              <h6 className="card-subtitle mb-2 text-muted">Description</h6>
                                              <p className="mb-0">{client.case_description || 'No description provided'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="col-md-6">
                                        <div className="detail-section">
                                          <h6 className="fw-bold text-uppercase text-primary small mb-3">
                                            <i className="bi bi-person me-2"></i>Client Information
                                          </h6>
                                          <div className="client-info-card card bg-white shadow-sm">
                                            <div className="card-body p-3">
                                              <div className="d-flex align-items-center mb-3">
                                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center me-3" 
                                                    style={{width: '48px', height: '48px'}}>
                                                  <i className="bi bi-person-fill fs-4"></i>
                                                </div>
                                                <div>
                                                  <h6 className="mb-0 fw-bold">
                                                    {client.userDetails ? 
                                                      `${client.userDetails.firstName} ${client.userDetails.lastName}` : 
                                                      'Unknown Client'}
                                                  </h6>
                                                  <p className="text-muted small mb-0">Client</p>
                                                </div>
                                              </div>
                                              
                                              <ul className="list-group list-group-flush border-top pt-2">
                                                <li className="list-group-item px-0 py-2 border-0 d-flex justify-content-between">
                                                  <span className="text-muted">Phone:</span>
                                                  <span className="fw-medium">
                                                    {client.userDetails?.phone || 'N/A'}
                                                  </span>
                                                </li>
                                                <li className="list-group-item px-0 py-2 border-0 d-flex justify-content-between">
                                                  <span className="text-muted">Email:</span>
                                                  <span className="fw-medium">
                                                    {client.userDetails?.email || 'N/A'}
                                                  </span>
                                                </li>
                                              </ul>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="col-lg-5">
                                    {client.status === 'Not Approved' ? (
                                      <div className="case-actions p-3">
                                        <h6 className="fw-bold text-uppercase text-primary small mb-3">
                                          <i className="bi bi-check-circle me-2"></i>Case Acceptance
                                        </h6>
                                        
                                        <div className="alert alert-light border mb-4">
                                          <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                                          Accepting this case will make it available for client interactions and payment processing.
                                        </div>
                                        
                                        <div className="mb-3">
                                          <label htmlFor="caseType" className="form-label fw-medium">Case Type</label>
                                          <select 
                                            id="caseType"
                                            name="caseType"
                                            className="form-select form-select-lg"
                                            value={caseForm.caseType}
                                            onChange={handleFormChange}
                                            required
                                            autoFocus
                                          >
                                            <option value="">Select case type...</option>
                                            {caseTypes.map(type => (
                                              <option key={type.value} value={type.value}>
                                                {type.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        
                                        <div className="mb-4">
                                          <label htmlFor="caseNumber" className="form-label fw-medium">Case Number</label>
                                          <div className="input-group input-group-lg">
                                            <span className="input-group-text">CASE</span>
                                            <input 
                                              type="text"
                                              id="caseNumber"
                                              name="caseNumber"
                                              className="form-control"
                                              placeholder="e.g. 2023001"
                                              value={caseForm.caseNumber}
                                              onChange={handleFormChange}
                                              required
                                            />
                                          </div>
                                          <div className="form-text">Unique identifier for this case</div>
                                        </div>
                                        
                                        <div className="d-grid gap-2">
                                          <button 
                                            type="button" 
                                            className="btn btn-lg btn-success"
                                            onClick={() => handleConfirmCase(client._id)}
                                            disabled={!caseForm.caseType || !caseForm.caseNumber || processingCaseId === client._id}
                                          >
                                            {processingCaseId === client._id ? (
                                              <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                            ) : (
                                              <><i className="bi bi-check2-circle me-2"></i>Accept Case</>
                                            )}
                                          </button>
                                          <div className="d-flex justify-content-between gap-2">
                                            <button 
                                              type="button"
                                              className="btn btn-outline-danger w-100"
                                              onClick={() => handleRejectCase(client._id)}
                                              disabled={processingCaseId === client._id}
                                            >
                                              <i className="bi bi-x-circle me-2"></i>Reject Case
                                            </button>
                                            <button 
                                              type="button"
                                              className="btn btn-outline-secondary"
                                              onClick={() => handleExpandCase(client._id)}
                                            >
                                              <i className="bi bi-chevron-up"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="case-status-info p-4 text-center">
                                        <div className="mb-4">
                                          <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${
                                            client.status === 'Open' ? 'bg-success' : 'bg-secondary'
                                          }`} style={{width: '80px', height: '80px'}}>
                                            <i className={`bi ${
                                              client.status === 'Open' ? 'bi-unlock-fill' : 'bi-lock-fill'
                                            } text-white fs-1`}></i>
                                          </div>
                                        </div>
                                        <h5>This case is {client.status}</h5>
                                        <p className="text-muted mb-4">
                                          {client.status === 'Open' ? 
                                            'This case has been approved and is currently active.' : 
                                            'This case has been closed.'}
                                        </p>
                                        <button 
                                          className="btn btn-primary"
                                          onClick={() => window.location.href = `/case-details/${client._id}`}
                                        >
                                          <i className="bi bi-file-earmark-text me-2"></i>
                                          View Full Case Details
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
