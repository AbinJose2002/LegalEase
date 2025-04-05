import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function Case() {
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError,] = useState(null);
  const [caseNum, setCaseNum] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const caseTypes = [
    { value: 'all', label: 'All Cases' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'civil', label: 'Civil Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'business', label: 'Business Law' },
    { value: 'property', label: 'Property Law' },
    { value: 'other', label: 'Other' }
  ];

  const getCaseTypeLabel = (type) => {
    const types = {
      criminal: 'Criminal Law',
      civil: 'Civil Law',
      family: 'Family Law',
      business: 'Business Law',
      property: 'Property Law',
      other: 'Other'
    };
    return types[type] || type;
  };

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

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const advToken = localStorage.getItem('advocatetoken');
        const response = await axios.post('http://localhost:8080/api/case/view', { advToken });
        setClientDetails(response.data.clients);
        console.log(response.data.clients);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
    console.log(caseNum);
  }, []);

  const handleCloseCase = async (caseId) => {
    try {
      const response = await axios.post('http://localhost:8080/api/case/close', { caseId });
      if (response.data.success === "true") {
        const updatedCases = clientDetails.map(client => 
          client._id === caseId ? { ...client, status: 'Closed' } : client
        );
        setClientDetails(updatedCases);
        alert('Case closed successfully');
      }
    } catch (error) {
      console.error('Error closing case:', error);
      alert('Failed to close case');
    }
  };

  const filteredCases = clientDetails.filter(client => 
    selectedFilter === 'all' ? true : client.caseType === selectedFilter
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-3">Loading case data...</span>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">Error</h4>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="case-management fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0 fw-bold scale-in">
          <i className="bi bi-briefcase me-2 text-primary"></i>
          Case Management
        </h2>
        
        <div className="d-flex align-items-center">
          <div className="filter-dropdown me-2">
            <select 
              className="form-select shadow-sm"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              aria-label="Filter by case type"
            >
              {caseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="btn-group">
            <button className="btn btn-outline-primary">
              <i className="bi bi-funnel"></i>
            </button>
            <button className="btn btn-outline-primary">
              <i className="bi bi-sort-down"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="alert alert-info mb-4">
        <div className="d-flex">
          <div className="me-3">
            <i className="bi bi-info-circle-fill fs-4"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-1">Payment Required</h5>
            <p className="mb-0">Cases marked as "In Progress" require client payment to proceed.</p>
          </div>
        </div>
      </div>
      
      {filteredCases.length === 0 ? (
        <div className="empty-state text-center p-5 bg-light rounded-3">
          <div className="py-5">
            <i className="bi bi-folder text-secondary" style={{fontSize: '3rem'}}></i>
            <h4 className="mt-3">No cases found</h4>
            <p className="text-muted">No cases match your current filter. Try changing the filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Case ID</th>
                  <th>Type</th>
                  <th>Title & Description</th>
                  <th>Client</th>
                  <th className="text-center">Status</th>
                  {/* <th className="text-end">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((client) => (
                  <tr key={client._id} className="table-row-animation">
                    <td>
                      <span className="badge bg-light text-dark border">
                        {client.case_id}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info text-white rounded-pill px-3 py-2">
                        {getCaseTypeLabel(client.caseType)}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{client.case_title}</div>
                        <div className="text-muted small text-truncate" style={{maxWidth: '300px'}}>
                          {client.case_description}
                        </div>
                        <div className="mt-1 small text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {getRelativeTime(client.created_at)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-2" 
                            style={{width: '32px', height: '32px'}}>
                          <i className="bi bi-person text-primary"></i>
                        </div>
                        <div>
                          <div>{`${client.userDetails.firstName} ${client.userDetails.lastName}`}</div>
                          <small className="text-muted">{client.userDetails.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span 
                        className={`badge rounded-pill px-3 py-2 ${
                          client.status === 'Not Approved' ? 'bg-warning text-dark' : 
                          client.status === 'Open' ? 'bg-success' : 
                          client.status === 'In Progress' ? 'bg-info' :
                          client.status === 'Closed' ? 'bg-secondary' : 
                          'bg-light text-dark'
                        }`}
                      >
                        <i className={`bi me-1 ${
                          client.status === 'Not Approved' ? 'bi-hourglass-split' : 
                          client.status === 'Open' ? 'bi-unlock' : 
                          client.status === 'In Progress' ? 'bi-gear' :
                          client.status === 'Closed' ? 'bi-lock' : 
                          'bi-question-circle'
                        }`}></i>
                        {client.status}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <div className="text-muted small">
              Showing {filteredCases.length} of {clientDetails.length} cases
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary me-2" disabled>
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <button className="btn btn-sm btn-outline-primary" disabled>
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}