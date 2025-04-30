import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Payment() {
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState("Advance");
  const [amount, setAmount] = useState("");
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        
        // Get the advocate token from localStorage - try both possible key names
        const advToken = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
        
        if (!advToken) {
          setError('No advocate token found. Please log in.');
          setLoading(false);
          return;
        }

        // Get the advocate ID
        const advocateId = localStorage.getItem('advocateId');
        console.log("Fetching cases for advocate ID:", advocateId);
        
        // Use post method with advToken to ensure we only get this advocate's cases
        const response = await axios.post(
          'http://localhost:8080/api/case/fetch', 
          { advToken },
          { headers: { 'Authorization': `Bearer ${advToken}` }}
        );

        console.log("Cases response:", response.data);
        
        if (response.data && response.data.success === "true") {
          // Filter out cases that aren't "Open" or "Closed" as these are the valid states
          // for cases that can have payments
          const validCases = response.data.clients.filter(
            c => c.status === "Open" || c.status === "Closed"
          );
          
          console.log(`Found ${validCases.length} valid cases for this advocate`);
          setCases(validCases);
        } else {
          console.warn("Unexpected response format:", response.data);
          setError("No cases found or unexpected data format.");
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError(err.response?.data?.message || "Error fetching cases. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleChange = async (e) => {
    const selectedCaseId = e.target.value;
    setSelectedCase(selectedCaseId);

    if (!selectedCaseId) {
      setPayments([]);
      return;
    }

    try {
      // Show loading state while fetching payments
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
      
      console.log(`Fetching payments for case ID: ${selectedCaseId}`);
      
      // Make sure we're using the correct endpoint and payload format
      const res = await axios.post(
        "http://localhost:8080/api/payment/fetch-case", 
        { selectedCaseId, caseId: selectedCaseId }, // Send both formats to be safe
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      console.log("Payments fetch response:", res.data);
      
      if (res.data && res.data.success === true) {
        const receivedPayments = res.data.payments || [];
        console.log(`Found ${receivedPayments.length} payments for case`);
        setPayments(receivedPayments);
      } else if (res.data && res.data.success === "true") {
        // Handle string "true" success indicator
        const receivedPayments = res.data.payments || [];
        console.log(`Found ${receivedPayments.length} payments for case`);
        setPayments(receivedPayments);
      } else {
        // Check if there's a different data structure
        if (res.data && Array.isArray(res.data)) {
          console.log("Got array response for payments");
          setPayments(res.data);
        } else {
          console.warn("Unexpected payment data format:", res.data);
          setError("Could not retrieve payment data in the expected format");
          setPayments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      
      if (error.response) {
        console.error("Server error response:", error.response.data);
        setError(`Server error: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setError("Could not reach the server. Please check your connection.");
      } else {
        setError("Error fetching payments: " + error.message);
      }
      
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedCase || !amount || amount <= 0 || !paymentType) {
      alert("Please fill all required fields with valid values");
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
      const advocateId = localStorage.getItem('advocateId');
      
      console.log(`Creating ${paymentType} payment for case ID: ${selectedCase}`);
      
      // Use a single endpoint for all payment types
      const response = await axios.post(
        "http://localhost:8080/api/payment/add", 
        {
          case_id: selectedCase,
          type: paymentType,
          amount: Number(amount),
          advocate_id: advocateId
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Payment response:", response.data);

      if (response.data && (response.data.success === true || response.data.success === "true")) {
        // Show success message
        alert(`${paymentType} payment added successfully!`);
        setShowPaymentForm(false);
        setAmount("");
        
        // Refresh the payments list for this case
        await handleChange({ target: { value: selectedCase } });
      } else {
        throw new Error(response.data?.message || `Failed to add ${paymentType} payment`);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      
      if (error.response) {
        console.error("Server error response:", error.response.data);
        alert(`Failed to add payment: ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert(`Failed to add payment: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a separate function to handle Pay Now button
  const handlePay = async (paymentId) => {
    try {
      setProcessingPaymentId(paymentId);
      const token = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
      
      // Find the payment details from state
      const paymentToProcess = payments.find(p => p._id === paymentId);
      
      if (!paymentToProcess) {
        throw new Error("Payment details not found");
      }
      
      console.log("Initiating payment process for:", paymentToProcess);
      
      // Initiate the payment - use the single endpoint that works
      const response = await axios.post(
        "http://localhost:8080/api/payment/process", 
        { 
          paymentId: paymentId,
          caseId: selectedCase,
          amount: paymentToProcess.amount,
          type: paymentToProcess.type
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Payment process response:", response.data);
      
      if (response.data && response.data.url) {
        // Redirect to payment gateway URL
        window.location.href = response.data.url;
      } else if (response.data && response.data.success) {
        alert("Payment processed successfully!");
        
        // Refresh the payments list
        await handleChange({ target: { value: selectedCase } });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      alert(`Payment processing failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Helper function to refresh payments
  const refreshPayments = async (caseId) => {
    try {
      const token = localStorage.getItem('advtoken') || localStorage.getItem('advocatetoken');
      const res = await axios.post(
        "http://localhost:8080/api/payment/fetch-case", 
        { selectedCaseId: caseId },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      if (res.data && res.data.payments) {
        setPayments(res.data.payments);
      }
    } catch (error) {
      console.error("Error refreshing payments:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Payment Management</h2>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Select Case</h5>
        </div>
        <div className="card-body">
          <select 
            className="form-select form-select-lg mb-3" 
            aria-label="Select a case" 
            onChange={handleChange}
            value={selectedCase}
            disabled={loading}
          >
            <option value="">-- Select a case --</option>
            {cases.map((caseItem) => (
              <option key={caseItem._id} value={caseItem._id}>
                {caseItem.case_id || 'Case ID N/A'} - {caseItem.case_title} 
                {caseItem.userDetails ? 
                  ` - ${caseItem.userDetails.firstName} ${caseItem.userDetails.lastName}` : 
                  ' - Client details not available'}
              </option>
            ))}
          </select>

          {selectedCase && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPaymentForm(true)}
              disabled={loading}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Payment
            </button>
          )}
        </div>
      </div>

      {showPaymentForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Add Payment</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Payment Type:</label>
                <select 
                  className="form-select" 
                  value={paymentType} 
                  onChange={(e) => setPaymentType(e.target.value)}
                  disabled={loading}
                >
                  <option value="Advance">Advance</option>
                  <option value="Sitting">Sitting</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPaymentForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleAddPayment}
                disabled={loading || !amount}
              >
                {loading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCase && (
        <div className="card shadow-sm">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payment History</h5>
            {loading && (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
          <div className="card-body">
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : payments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Payment Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment._id || index}>
                        <td>{index + 1}</td>
                        <td>{payment.type}</td>
                        <td>
                          <span className={`badge ${payment.status === "Completed" ? 'bg-success' : 'bg-warning'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>${payment.amount}</td>
                        <td>{new Date(payment.payment_date || payment.createdAt).toLocaleDateString()}</td>
                        <td>
                          {payment.status === "Completed" ? (
                            <button className='btn btn-sm btn-success disabled'>Paid</button>
                          ) : (
                            <button 
                              className='btn btn-sm btn-primary'
                              onClick={() => handlePay(payment._id)}
                              disabled={processingPaymentId === payment._id}
                            >
                              {processingPaymentId === payment._id ? 'Processing...' : 'Pay Now'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                No payments found for this case.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
