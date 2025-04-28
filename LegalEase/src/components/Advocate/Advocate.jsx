import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/animations.css';
import './Advocate.css'; // Add new CSS file

const Advocate = () => {
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [caseName, setCaseName] = useState('');
  const [caseDesc, setCaseDesc] = useState('');
  const navigate = useNavigate();
  const [advocates, setAdvocates] = useState([]);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        // Change the endpoint from /fetch to / since that's what's available in the backend
        const response = await axios.get('http://localhost:8080/api/advocate/');
        console.log('Advocate data received:', response.data);
        
        // Check data structure and format
        if (response.data.advocates && Array.isArray(response.data.advocates)) {
          console.log(`Found ${response.data.advocates.length} advocates`);
          setAdvocates(response.data.advocates);
        } else if (Array.isArray(response.data)) {
          // In case the data is directly an array
          console.log(`Found ${response.data.length} advocates (direct array)`);
          setAdvocates(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
          setAdvocates([]);
        }
      } catch (error) {
        console.error('Fetch advocates error:', error);
        setAdvocates([]);
      }
    };
    fetchAdvocates();
  }, []);

  useEffect(() => {
    console.log('Advocates state updated:', advocates);
  }, [advocates]);

  const submitCase = async () => {
    try {
      const caseDetails = {
        caseName,
        caseDesc,
        advocate: selectedAdvocate,
        client_id: localStorage.usertoken,
      };
      const res = await axios.post('http://localhost:8080/api/case/submit', { caseDetails });
      if (res.data.success === 'true') {
        alert(
          `Case submitted successfully!\nYour Case ID is: ${res.data.caseId}\nPlease save this ID for future reference.`
        );
        window.location.href = 'http://localhost:5173/';
      }
    } catch (error) {
      console.log(error);
      alert('Failed to submit case. Please try again.');
    }
  };

  return (
    <section className={`advocate-section py-5 ${contentVisible ? 'content-visible' : ''}`} id="advocate">
      <div className="pattern-overlay"></div>
      <div className="container position-relative">
        <div className="text-center mb-5 fade-in visible">
          <p className="pre-title">Legal Professionals</p>
          <h2 className="fw-bold mb-3 section-title">
            Our <span className="highlight">Expert</span> Advocates
          </h2>
          <p className="text-muted mx-auto section-description">
            Connect with our experienced legal professionals specializing in various areas of law.
          </p>
        </div>

        {advocates.length === 0 && (
          <div className="text-center py-5 fade-in">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading advocates...</p>
          </div>
        )}

        <div className="row g-4">
          {advocates && advocates.length > 0 ? (
            advocates.map((advocate, index) => (
              <div
                key={advocate._id || advocate.id || index}
                className="col-md-4 fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card advocate-card h-100 p-4">
                  <div className="card-img-wrapper">
                    <img
                      src={advocate.image ? `http://localhost:8080/uploads/${advocate.image}` : 'https://via.placeholder.com/150'}
                      className="rounded-circle advocate-image"
                      alt={`${advocate.firstName || 'Advocate'} ${advocate.lastName || ''}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title mt-2">
                      {`Adv. ${advocate.firstName || ''} ${advocate.lastName || ''}`}
                    </h5>
                    <div className="specialization-pills">
                      {advocate.specialization && Array.isArray(advocate.specialization) ? (
                        <>
                          {advocate.specialization.slice(0, 2).map((specialty, specIndex) => (
                            <span
                              key={`${advocate._id || advocate.id || index}-spec-${specIndex}`}
                              className="specialty-pill"
                            >
                              {specialty.label || specialty.name || specialty}
                            </span>
                          ))}
                          {advocate.specialization.length > 2 && (
                            <span
                              key={`${advocate._id || advocate.id || index}-more`}
                              className="specialty-pill more-pill"
                            >
                              +{advocate.specialization.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="specialty-pill">General Practice</span>
                      )}
                    </div>

                    <button
                      className="btn profile-btn mt-3"
                      data-bs-toggle="modal"
                      data-bs-target="#advocateModal"
                      onClick={() => {
                        console.log("Selected advocate:", advocate);
                        setSelectedAdvocate(advocate);
                      }}
                    >
                      View Profile <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>

        <div className="section-divider"></div>

        <div className="why-choose-section text-center my-5 fade-in visible">
          <h3 className="mb-4 sub-section-title">Why Choose Our Legal Experts?</h3>
          <div className="row mt-4">
            <div className="col-md-4 mb-4">
              <div className="reason-card">
                <div className="reason-icon">⚖️</div>
                <h4>Expertise & Experience</h4>
                <p>Our advocates have years of experience in their specialized legal domains</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="reason-card">
                <div className="reason-icon">🤝</div>
                <h4>Client-First Approach</h4>
                <p>We prioritize your needs and provide personalized legal solutions</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="reason-card">
                <div className="reason-icon">📈</div>
                <h4>Proven Success Record</h4>
                <p>Our advocates have successfully handled numerous complex legal cases</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="advocateModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content slide-in-up">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedAdvocate
                    ? `${selectedAdvocate.firstName} ${selectedAdvocate.lastName}`
                    : 'Advocate Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedAdvocate && (
                  <>
                    <div className="text-center">
                      <img
                        src={`http://localhost:8080/uploads/${selectedAdvocate.image}`}
                        className="rounded-circle mb-3 advocate-modal-image"
                        alt={selectedAdvocate.name}
                      />
                    </div>
                    <div className="advocate-info">
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedAdvocate.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Advance Fee:</span>
                        <span className="info-value">${selectedAdvocate.advanceFee}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Sitting Fee:</span>
                        <span className="info-value">${selectedAdvocate.sittingFee}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedAdvocate.phone}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Experience:</span>
                        <span className="info-value">{selectedAdvocate.experience} years</span>
                      </div>
                      <div className="specializations-container">
                        <span className="info-label">Specializations:</span>
                        <div className="specialization-pills modal-pills">
                          {selectedAdvocate.specialization?.map((specialty, specIndex) => (
                            <span key={`modal-spec-${specIndex}`} className="specialty-pill">
                              {specialty.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="button" className="btn consult-btn">
                  Consult Me
                </button>
                <button
                  data-bs-dismiss="modal"
                  type="button"
                  className="btn hire-btn"
                  onClick={() => {
                    if (!localStorage.usertoken) {
                      alert('Please Login to Hire Advocate');
                      navigate('/login');
                    } else {
                      const hireModal = new bootstrap.Modal(
                        document.getElementById('hireModal')
                      );
                      hireModal.show();
                    }
                  }}
                >
                  Hire Me
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="hireModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content slide-in-up">
              <div className="modal-header">
                <h5 className="modal-title">Submit Case Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedAdvocate && (
                  <div className="case-form">
                    <div className="form-group mb-3">
                      <label htmlFor="casename" className="form-label">
                        Case Name
                      </label>
                      <input
                        type="text"
                        name="casename"
                        className="form-control custom-input"
                        value={caseName}
                        onChange={(e) => {
                          setCaseName(e.target.value);
                        }}
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="casedesc" className="form-label">
                        Case Description
                      </label>
                      <textarea
                        name="casedesc"
                        className="form-control custom-input"
                        rows="5"
                        value={caseDesc}
                        onChange={(e) => {
                          setCaseDesc(e.target.value);
                        }}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn submit-btn"
                  onClick={() => {
                    submitCase();
                  }}
                >
                  Submit Case Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons text-center mt-5 fade-in visible">
          <h3 className="mb-4 sub-section-title">Ready To Join Our Team?</h3>
          <button
            className="btn practice-btn me-3"
            onClick={() => {
              navigate('/advocate-register');
            }}
          >
            Want To Practice Law
          </button>
          <button className="btn view-all-btn">
            View All Advocates
            <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Advocate;
