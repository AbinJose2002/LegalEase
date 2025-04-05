import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Payment() {
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(""); 
  const [selectedAdvocateId, setSelectedAdvocateId] = useState(""); 
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const userToken = localStorage.getItem('usertoken');
        if (!userToken) {
          setError('No user token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.post('http://localhost:8080/api/case/view-user', { 
          advToken: userToken 
        });

        if (response.data && response.data.success === "true" && response.data.clients) {
          setCases(response.data.clients);
          console.log("Fetched user cases:", response.data.clients);
        } else {
          setError("No cases found or invalid response format.");
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError(err.response?.data?.message || "Error fetching cases.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleCaseChange = async (e) => {
    const selectedCaseId = e.target.value;
    setSelectedCase(selectedCaseId);
    setPayments([]);
    
    if (!selectedCaseId) return;
    
    setLoading(true);

    try {
      const selectedCaseData = cases.find((c) => c._id === selectedCaseId);
      if (selectedCaseData) {
        setSelectedAdvocateId(selectedCaseData.advocate_id);
      }

      const res = await axios.post("http://localhost:8080/api/payment/fetch-case", { selectedCaseId });
      
      if (res.data && res.data.payments) {
        setPayments(res.data.payments);
        console.log("Fetched payments:", res.data.payments);
      } else {
        console.log("No payments found for this case");
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setError("Failed to fetch payment details.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (paymentId) => {
    try {
      setLoadingPayment(true);
      console.log(`Initiating payment for payment ID: ${paymentId}, case: ${selectedCase}`);
      
      const res = await axios.post('http://localhost:8080/api/payment/sitting', {
        selectedCase, 
        paymentId
      });
      
      if (res.data?.url) {
        console.log("Redirecting to payment gateway:", res.data.url);
        window.location.href = res.data.url;
      } else {
        setError("Invalid payment URL received.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError("Payment processing failed. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const getCaseName = (caseId) => {
    const caseItem = cases.find(c => c._id === caseId);
    return caseItem ? caseItem.case_title : 'Unknown Case';
  };

  return (
    <div className="payment-manager fade-in">
      <div className="card shadow-lg border-0 rounded-4 mb-4">
        <div className="card-header bg-gradient-primary border-0 text-white p-4" 
             style={{background: 'linear-gradient(135deg, #3a7bd5, #3a6073)'}}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-0 fw-bold">Payment Management</h2>
              <p className="mb-0 text-white-50">Manage and track your case payments</p>
            </div>
            <div className="payment-icon bg-white bg-opacity-10 rounded-circle p-3">
              <i className="bi bi-credit-card fs-2 text-white"></i>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          <div className="mb-4">
            <label htmlFor="case-select" className="form-label fw-bold mb-2">Select a Case</label>
            <select 
              id="case-select"
              className="form-select form-select-lg shadow-sm hover-lift"
              value={selectedCase}
              onChange={handleCaseChange}
              disabled={loading || cases.length === 0}
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderColor: '#dee2e6',
                borderRadius: '0.5rem'
              }}
            >
              <option value="">-- Select a case --</option>
              {cases.map((caseItem) => (
                <option key={caseItem._id} value={caseItem._id}>
                  {caseItem.case_id ? `${caseItem.case_id}: ` : ''}{caseItem.case_title}
                </option>
              ))}
            </select>
            {cases.length === 0 && !loading && !error && (
              <div className="form-text text-muted">
                <i className="bi bi-info-circle me-1"></i>
                No cases available. Please create a case first.
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="alert alert-danger slide-in-right d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
              <div className="flex-grow-1">
                <strong>Error:</strong> {error}
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)} 
                aria-label="Close"
              ></button>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading payment data...</span>
              </div>
              <p className="mt-2 text-muted">Loading payment information...</p>
            </div>
          )}

          {/* Case information section */}
          {!loading && selectedCase && (
            <>
              <div className="selected-case-info mb-4 p-3 bg-light rounded-3">
                <h5 className="mb-2">
                  <i className="bi bi-folder me-2 text-primary"></i>
                  {getCaseName(selectedCase)}
                </h5>
                <div className="d-flex justify-content-between">
                  <span className="badge bg-info rounded-pill">
                    <i className="bi bi-tag me-1"></i>
                    {selectedCase && cases.find(c => c._id === selectedCase)?.caseType || 'Unknown Type'}
                  </span>
                  <span className="badge bg-secondary rounded-pill">
                    <i className="bi bi-key me-1"></i>
                    ID: {selectedCase.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {/* New payments table design */}
              {payments.length > 0 ? (
                <div className="payments-container slide-in-bottom">
                  {/* Payment statistics cards */}
                  <div className="payment-stats-row row mb-4">
                    <div className="col-md-3 mb-3">
                      <div className="stat-card bg-light rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="text-muted mb-0">Total Payments</h6>
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <i className="bi bi-credit-card text-primary"></i>
                          </div>
                        </div>
                        <h3 className="mb-0">{payments.length}</h3>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="stat-card bg-light rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="text-muted mb-0">Total Amount</h6>
                          <div className="rounded-circle bg-success bg-opacity-10 p-2">
                            <i className="bi bi-currency-rupee text-success"></i>
                          </div>
                        </div>
                        <h3 className="mb-0">₹{payments.reduce((total, payment) => 
                          total + parseFloat(payment.amount), 0).toFixed(2)}</h3>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="stat-card bg-light rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="text-muted mb-0">Pending</h6>
                          <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                            <i className="bi bi-hourglass-split text-warning"></i>
                          </div>
                        </div>
                        <h3 className="mb-0 text-warning">₹{payments.filter(p => 
                          p.status !== 'Completed').reduce((total, payment) => 
                            total + parseFloat(payment.amount), 0).toFixed(2)}</h3>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="stat-card bg-light rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="text-muted mb-0">Completed</h6>
                          <div className="rounded-circle bg-success bg-opacity-10 p-2">
                            <i className="bi bi-check-circle text-success"></i>
                          </div>
                        </div>
                        <h3 className="mb-0 text-success">₹{payments.filter(p => 
                          p.status === 'Completed').reduce((total, payment) => 
                            total + parseFloat(payment.amount), 0).toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modern payment listing */}
                  <div className="new-payment-table bg-white rounded-3 shadow-sm">
                    <div className="payment-table-header d-flex align-items-center p-3 border-bottom">
                      <div className="payment-column-id" style={{width: '5%'}}>#</div>
                      <div className="payment-column-details" style={{width: '35%'}}>Details</div>
                      <div className="payment-column-status text-center" style={{width: '20%'}}>Status</div>
                      <div className="payment-column-amount text-end" style={{width: '15%'}}>Amount</div>
                      <div className="payment-column-actions text-center" style={{width: '25%'}}>Actions</div>
                    </div>
                    
                    <div className="payment-table-body">
                      {payments.map((payment, index) => (
                        <div 
                          key={payment._id}
                          className={`payment-row d-flex align-items-center p-3 fade-in ${
                            index !== payments.length - 1 ? 'border-bottom' : ''
                          } ${payment.status === 'Completed' ? 'payment-completed' : 'payment-pending'}`}
                          style={{ 
                            animationDelay: `${index * 0.1}s`,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div className="payment-column-id" style={{width: '5%'}}>
                            {index + 1}
                          </div>
                          <div className="payment-column-details" style={{width: '35%'}}>
                            <div className="d-flex align-items-center">
                              <div className={`payment-icon-container rounded-circle flex-shrink-0 me-3 ${
                                payment.type === 'advance' ? 'bg-info bg-opacity-10' :
                                payment.type === 'Sitting' ? 'bg-primary bg-opacity-10' :
                                'bg-secondary bg-opacity-10'
                              }`} style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <i className={`bi ${
                                  payment.type === 'advance' ? 'bi-cash text-info' :
                                  payment.type === 'Sitting' ? 'bi-person-workspace text-primary' :
                                  'bi-file-earmark-text text-secondary'
                                }`}></i>
                              </div>
                              <div>
                                <div className="payment-title fw-medium mb-1">{payment.type}</div>
                                <div className="payment-date small text-muted">
                                  <i className="bi bi-calendar me-1"></i>
                                  {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="payment-column-status text-center" style={{width: '20%'}}>
                            <span className={`badge rounded-pill px-3 py-2 ${payment.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                              <i className={`bi me-1 ${payment.status === 'Completed' ? 'bi-check-circle' : 'bi-hourglass-split'}`}></i>
                              {payment.status}
                            </span>
                          </div>
                          <div className="payment-column-amount text-end" style={{width: '15%'}}>
                            <div className="fw-bold">
                              <span className="currency-symbol me-1" style={{opacity: 0.5}}>₹</span>
                              {payment.amount}
                            </div>
                          </div>
                          <div className="payment-column-actions text-center" style={{width: '25%'}}>
                            {payment.status === "Completed" ? (
                              <button className='btn btn-sm btn-success rounded-pill px-3 disabled'>
                                <i className="bi bi-check-circle me-1"></i>
                                Payment Complete
                              </button>
                            ) : (
                              <button 
                                className='btn btn-sm btn-primary rounded-pill px-4 hover-lift shadow-sm'
                                onClick={() => handlePay(payment._id)}
                                disabled={loadingPayment}
                              >
                                {loadingPayment ? (
                                  <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                ) : (
                                  <><i className="bi bi-credit-card me-2"></i>Pay Now</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 bg-light rounded-3 mt-4">
                  <div className="py-4">
                    <i className="bi bi-cash-stack text-muted" style={{fontSize: '3rem'}}></i>
                    <h5 className="mt-3 mb-2">No Payments Required</h5>
                    <p className="text-muted mb-0">
                      There are no pending payments for this case at this time.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedCase && !loading && cases.length > 0 && (
            <div className="text-center p-5 bg-light rounded-3">
              <div className="py-4">
                <i className="bi bi-arrow-up-circle text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">Select a Case</h5>
                <p className="text-muted">Please select a case above to view payment details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          <h5 className="card-title mb-3">
            <i className="bi bi-info-circle me-2 text-primary"></i>
            Payment Information
          </h5>
          <p className="card-text text-muted">
            All payments are processed securely through our payment gateway. You will be redirected to a secure page to complete your transaction.
          </p>
          <div className="alert alert-info mb-0">
            <div className="d-flex">
              <div className="me-3">
                <i className="bi bi-lightbulb"></i>
              </div>
              <div>
                <h6 className="alert-heading mb-1">Important Note</h6>
                <p className="mb-0 small">
                  After completing a payment, you will receive a confirmation email with the receipt. Please keep this for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
