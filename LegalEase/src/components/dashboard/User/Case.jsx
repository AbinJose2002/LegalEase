import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the component
const Case = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // State for managing case creation/editing
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    caseNumber: '',
    caseType: 'civil' // Default value
  });

  const formRef = useRef(null);

  // Fetch cases including those not approved
  useEffect(() => {
    console.log("Case component mounted, fetching cases...");

    const fetchCases = async () => {
      try {
        const token = localStorage.getItem('usertoken');
        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        console.log("Fetching cases with token...");

        try {
          const response = await axios.post('http://localhost:8080/api/case/view-user', {
            advToken: token
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          console.log("View-user API response:", response.data);

          if (response.data && response.data.success === "true" && response.data.clients) {
            setCases(response.data.clients);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (apiError) {
          console.error("Error using direct API call:", apiError);

          try {
            const response = await axios.get('http://localhost:8080/api/case', {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Alternative API response:", response.data);

            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
              setCases(response.data.data);
            } else {
              if (process.env.NODE_ENV !== 'production') {
                console.log("Using development sample data");
                setCases([
                  {
                    _id: '1',
                    case_title: 'Sample Contract Dispute',
                    case_id: 'CS2023-001',
                    case_description: 'This is a sample case for development.',
                    status: 'Not Approved',
                    created_at: new Date().toISOString(),
                    caseType: 'civil'
                  },
                  {
                    _id: '2',
                    case_title: 'Sample Property Claim',
                    case_id: 'CS2023-002',
                    case_description: 'Sample property dispute case.',
                    status: 'Open',
                    created_at: new Date().toISOString(),
                    caseType: 'property'
                  }
                ]);
              } else {
                throw new Error("Could not retrieve cases from any endpoint");
              }
            }
          } catch (err) {
            console.error("All API attempts failed:", err);
            throw err;
          }
        }
      } catch (err) {
        console.error("Case fetch error:", err);
        setError(`Failed to load cases: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();

    return () => {
      console.log("Case component unmounting");
    };
  }, [navigate, retryCount]);

  // Filter cases when cases array or active filter changes
  useEffect(() => {
    if (cases.length > 0) {
      filterCases(activeFilter);
    } else {
      setFilteredCases([]);
    }
  }, [cases, activeFilter]);

  // Function to filter cases based on status
  const filterCases = (filter) => {
    switch (filter) {
      case 'pending':
        setFilteredCases(cases.filter(c =>
          c.status?.toLowerCase() === 'not approved' ||
          c.status?.toLowerCase() === 'pending'
        ));
        break;
      case 'open':
        setFilteredCases(cases.filter(c =>
          c.status?.toLowerCase() === 'open' ||
          c.status?.toLowerCase() === 'in progress'
        ));
        break;
      case 'closed':
        setFilteredCases(cases.filter(c =>
          c.status?.toLowerCase() === 'closed'
        ));
        break;
      case 'all':
      default:
        setFilteredCases(cases);
        break;
    }
  };

  // Handle filter button click
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Handle input change for the new case form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCase(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Toggle case creation form
  const toggleCaseForm = () => {
    const newIsCreating = !isCreatingCase;
    setIsCreatingCase(newIsCreating);

    if (newIsCreating) {
      // Reset form when opening
      setNewCase({
        title: '',
        description: '',
        caseNumber: '',
        caseType: 'civil'
      });

      // Focus the first field when form appears
      setTimeout(() => {
        const titleInput = document.getElementById('title');
        if (titleInput) titleInput.focus();
      }, 100);
    }
  };

  // Handle case submission
  const handleCaseSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('usertoken');

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch a real advocate for the case submission
      let advocateObj;
      try {
        const advocatesResponse = await axios.get('http://localhost:8080/api/advocate/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Available advocates:", advocatesResponse.data?.advocates || []);
        // Use the first advocate from the list
        advocateObj = advocatesResponse.data?.advocates?.[0] || null;

        if (!advocateObj) {
          setError("No advocate available for case assignment");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch advocates", err);
        // Fallback to a default advocate ID
        advocateObj = { _id: "67b62845a3abea7a990eff28" }; // Use the ID from your logs
      }

      const caseTypeValue = newCase.caseType || 'civil';

      const caseData = {
        caseDetails: {
          caseName: newCase.title,
          caseDesc: newCase.description,
          caseType: caseTypeValue,
          advocate: advocateObj,
          client_id: token
        }
      };

      console.log("Submitting case with data:", JSON.stringify(caseData, null, 2));

      const response = await axios.post('http://localhost:8080/api/case/submit', caseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Case submission response:", response.data);

      if (response.data && response.data.success === "true") {
        // Reset form
        setNewCase({
          title: '',
          description: '',
          caseNumber: '',
          caseType: 'civil'
        });

        // Hide the form
        setIsCreatingCase(false);

        // Refresh cases
        setRetryCount(prev => prev + 1);
      } else {
        setError(response.data?.message || "Failed to submit case");
      }
    } catch (err) {
      console.error("Case submission error:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        const errorMessage = err.response.data?.message || err.response.data?.error || err.message;
        setError(`Failed to submit case (${err.response.status}): ${errorMessage}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response received from server. Please check your connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cases-container text-center my-5" ref={containerRef}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading cases...</span>
        </div>
        <p className="mt-2 text-muted">Loading your cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger cases-container" role="alert" ref={containerRef}>
        <h4 className="alert-heading">Error loading cases</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0">Please try again or check your connection.</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryCount(prev => prev + 1);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cases-container" ref={containerRef} style={{
      minHeight: "700px",
      position: "relative"
    }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Your Cases</h2>
        <button
          className={`btn ${isCreatingCase ? 'btn-outline-secondary' : 'btn-primary'}`}
          onClick={toggleCaseForm}
        >
          {isCreatingCase ? (
            <>Cancel</>
          ) : (
            <><i className="bi bi-plus-circle me-2"></i>New Case</>
          )}
        </button>
      </div>

      {/* Inline case creation form */}
      {isCreatingCase && (
        <div className="card mb-4 shadow-sm form-slide-down" ref={formRef}>
          <div className="card-header bg-light">
            <h5 className="mb-0">Create New Case</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCaseSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="title" className="form-label">Case Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={newCase.title}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="caseNumber" className="form-label">Case Number (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="caseNumber"
                    name="caseNumber"
                    placeholder="e.g. CS2023-001"
                    value={newCase.caseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="caseType" className="form-label">Case Type</label>
                <select
                  className="form-select"
                  id="caseType"
                  name="caseType"
                  value={newCase.caseType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="criminal">Criminal</option>
                  <option value="civil">Civil</option>
                  <option value="family">Family</option>
                  <option value="business">Business</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Case Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="4"
                  value={newCase.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={toggleCaseForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : 'Submit Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`}
            type="button"
            onClick={() => handleFilterChange('all')}
          >
            All Cases
            <span className="badge bg-secondary ms-2">{cases.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeFilter === 'pending' ? 'active' : ''}`}
            type="button"
            onClick={() => handleFilterChange('pending')}
          >
            Pending Approval
            <span className="badge bg-warning ms-2">
              {cases.filter(c => c.status?.toLowerCase() === 'not approved' || c.status?.toLowerCase() === 'pending').length}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeFilter === 'open' ? 'active' : ''}`}
            type="button"
            onClick={() => handleFilterChange('open')}
          >
            Open
            <span className="badge bg-success ms-2">
              {cases.filter(c => c.status?.toLowerCase() === 'open' || c.status?.toLowerCase() === 'in progress').length}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeFilter === 'closed' ? 'active' : ''}`}
            type="button"
            onClick={() => handleFilterChange('closed')}
          >
            Closed
            <span className="badge bg-secondary ms-2">
              {cases.filter(c => c.status?.toLowerCase() === 'closed').length}
            </span>
          </button>
        </li>
      </ul>

      {filteredCases.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          {cases.length === 0
            ? "You don't have any cases yet. Create a new case to get started."
            : `No ${activeFilter !== 'all' ? activeFilter : ''} cases found.`}
        </div>
      ) : (
        <div className="row">
          {filteredCases.map(caseItem => (
            <div key={caseItem._id || Math.random().toString()} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm hover-lift">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <span className={`badge bg-${getCaseStatusBadge(caseItem.status)}`}>
                    {caseItem.status || 'Unknown'}
                  </span>
                  <small className="text-muted">
                    #{caseItem.case_id || 'New'}
                  </small>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{caseItem.case_title || 'Untitled Case'}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {caseItem.caseType ? `Type: ${caseItem.caseType}` : 'Type: Not Specified'}
                  </h6>
                  <p className="card-text">
                    {caseItem.case_description
                      ? `${caseItem.case_description.substring(0, 100)}${caseItem.case_description.length > 100 ? '...' : ''}`
                      : 'No description available'
                    }
                  </p>
                </div>
                <div className="card-footer bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {caseItem.created_at
                        ? new Date(caseItem.created_at).toLocaleDateString()
                        : 'Date unknown'}
                    </small>
                    {/* <button className="btn btn-sm btn-outline-primary">View Details</button> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to determine badge color based on case status
function getCaseStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'success';
    case 'closed':
      return 'secondary';
    case 'not approved':
    case 'pending':
      return 'warning';
    case 'in progress':
      return 'info';
    case 'urgent':
      return 'danger';
    default:
      return 'info';
  }
}

export default Case;