import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Payment() {
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(""); 
  const [selectedAdvocateId, setSelectedAdvocateId] = useState(""); // New state to store advocate ID

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const advToken = localStorage.getItem('usertoken');
        if (!advToken) {
          setError('No user token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.post('http://localhost:8080/api/case/view', { advToken });

        if (response.data && response.data.clients) {
          setCases(response.data.clients);
        } else {
          setError("No cases found.");
        }
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Error fetching cases.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleChange = async (e) => {
    const selectedCaseId = e.target.value;
    setSelectedCase(selectedCaseId);

    // Find the selected case to extract advocate_id
    const selectedCaseData = cases.find((c) => c._id === selectedCaseId);
    if (selectedCaseData) {
      setSelectedAdvocateId(selectedCaseData.advocate_id); // Store advocate ID
    }

    try {
      const res = await axios.post("http://localhost:8080/api/payment/fetch-case", { selectedCaseId });
      setPayments(res.data.payments);
    } catch (error) {
      console.log(error);
      setPayments([]);
    }
  };

  const handlePay = async (paymentId) => {
    try {
      const res = await axios.post('http://localhost:8080/api/payment/sitting',{selectedCase, paymentId})
      window.location.href = res.data.url
    } catch (error) {
      console.log("Error ", error)
    }
  }

  return (
    <div className="container mt-4 fade-in">
      <div className="card shadow-sm border-0 p-4">
        <h2 className="display-6 fw-bold mb-4 text-gradient">Payment Management</h2>

        {loading && (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger slide-in-right">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <select 
          className="form-select mb-4 hover-lift"
          aria-label="Select a case" 
          onChange={handleChange}
          style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
        >
          <option value="">Select a case</option>
          {cases.map((caseItem) => (
            <option key={caseItem._id} value={caseItem._id}>
              {caseItem.case_title}
            </option>
          ))}
        </select>

        {payments.length > 0 ? (
          <div className="table-responsive slide-in-bottom">
            <table className="table table-hover">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">#</th>
                  <th className="fw-semibold">Type</th>
                  <th className="fw-semibold">Status</th>
                  <th className="fw-semibold">Amount</th>
                  <th className="fw-semibold">Payment Date</th>
                  <th className="fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id}
                      className="fade-in"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <span className="badge bg-info">
                        <i className="fas fa-file-invoice-dollar me-1"></i>
                        {payment.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${payment.status === 'Completed' ? 'success' : 'warning'}`}>
                        <i className={`fas fa-${payment.status === 'Completed' ? 'check-circle' : 'clock'} me-1`}></i>
                        {payment.status}
                      </span>
                    </td>
                    <td className="fw-bold">₹{payment.amount}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>
                      {payment.status === "Completed" ? 
                        <button className='btn btn-success btn-sm disabled'>
                          <i className="fas fa-check me-1"></i>
                          Paid
                        </button> : 
                        <button 
                          className='btn btn-primary btn-sm hover-lift'
                          onClick={() => handlePay(payment._id)}
                        >
                          <i className="fas fa-credit-card me-1"></i>
                          Pay Now
                        </button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          selectedCase && (
            <div className="text-center p-5 mt-4">
              <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No payments found for this case</h5>
            </div>
          )
        )}
      </div>
    </div>
  );
}
