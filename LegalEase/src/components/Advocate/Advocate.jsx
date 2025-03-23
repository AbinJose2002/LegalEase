import React from 'react';
import { useEffect, useState } from 'react';
import advocate from '../../assets/advocate.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/animations.css';

const Advocate = () => {
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [caseName, setCaseName] = useState('')
  const [caseDesc, setCaseDesc] = useState('')

  const navigate = useNavigate();
  const [advocates, setAdvocates] = useState([])
  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/advocate/fetch');
        console.log(response.data.advocates)
        setAdvocates(response.data.advocates);
      } catch (error) {
        console.error('Fetch advocates error:', error);
      }
    }
    fetchAdvocates();
  }, [])

  const submitCase = async () => {
    try {
      const caseDetails = {
        caseName,
        caseDesc,
        advocate: selectedAdvocate,
        client_id: localStorage.usertoken
      }
      const res = await axios.post("http://localhost:8080/api/case/submit", {caseDetails})
      if(res.data.success === "true"){
        alert(`Case submitted successfully!\nYour Case ID is: ${res.data.caseId}\nPlease save this ID for future reference.`);
        window.location.href = 'http://localhost:5173/'
      }
    } catch (error) {
      console.log(error)
      alert('Failed to submit case. Please try again.')
    }
  }

  return (
    <section className="py-5 bg-light" id="advocate">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Our Expert Advocates</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Connect with our experienced legal professionals specializing in various areas of law.
          </p>
        </div>

        <div className="row g-4">
          {advocates.map((advocate, index) => (
            <div 
              key={advocate.id} 
              className="col-md-4 fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card h-100 p-4 hover-lift">
                <div className="text-center">
                  <img
                    src={`http://localhost:8080/uploads/${advocate.image}`}
                    className="rounded-circle"
                    alt={advocate.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title mt-2">{`Adv. ${advocate.firstName} ${advocate.lastName}`}</h5>
                  <p className="card-text text-muted mb-1">
                    <strong>Specializations:</strong>{" "}
                    {advocate.specialization?.map((specialty, index) => (
                      <span key={index}>
                        {specialty.label}
                        {index !== advocate.specialization.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>

                  {/* Open Modal on Click */}
                  <button
                    className="btn btn-outline-primary mt-2"
                    data-bs-toggle="modal"
                    data-bs-target="#advocateModal"
                    onClick={() => {setSelectedAdvocate(advocate)}}
                  >
                    View Profile <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal fade" id="advocateModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content slide-in-up">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedAdvocate
                    ? `${selectedAdvocate.firstName} ${selectedAdvocate.lastName}`
                    : "Advocate Details"}
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
                        className="rounded-circle mb-3"
                        alt={selectedAdvocate.name}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <p>
                      <strong>Email:</strong> {selectedAdvocate.email}
                    </p>
                    <p>
                      <strong>Advance Fee:</strong> {selectedAdvocate.advanceFee}
                    </p>
                    <p>
                      <strong>Sitting Fee:</strong> {selectedAdvocate.sittingFee}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedAdvocate.phone}
                    </p>
                    <p>
                      <strong>Experience:</strong> {selectedAdvocate.experience}{" "}
                      years
                    </p>
                    <p>
                      <strong>Specializations:</strong>{" "}
                      {selectedAdvocate.specialization?.map((specialty, index) => (
                        <span key={index}>
                          {specialty.label}
                          {index !== selectedAdvocate.specialization.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))}
                    </p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                >
                  Consult Me
                </button>
                <button
                data-bs-dismiss="modal"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!localStorage.usertoken) {
                      alert("Please Login to Hire Advocate");
                      navigate("/login");
                    } else {
                      const hireModal = new bootstrap.Modal(document.getElementById("hireModal"));
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
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Submit Case Details</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {selectedAdvocate && (
                    <>
                      <label htmlFor="casename" className="form-label">Case Name
                      </label>
                      <input type="text" name="casename" className='form-control' value={caseName} onChange={(e)=>{setCaseName(e.target.value)}} />
                      
                      <label htmlFor="casedesc" className="form-label">Case Description
                      </label>
                      <textarea name="casedesc" className='form-control' id="" value={caseDesc} onChange={(e)=>{setCaseDesc(e.target.value)}}></textarea>
                      
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {submitCase()}}
                  >
                    Submit Case Details
                  </button>
                </div>
              </div>
            </div>
          </div> 

        <div className="text-center mt-4 d-flex justify-content-center flex-column col-md-2 mx-auto">
          <button className='btn btn-outline-primary' onClick={() => { navigate('/advocate-register') }}>Want To Practise Law</button>
          <button
            className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center mt-3"
          >
            View All Advocates
            <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Advocate;
