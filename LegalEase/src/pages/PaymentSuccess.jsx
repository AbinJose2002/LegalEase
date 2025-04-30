import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get('payment_id');
  const sessionId = searchParams.get('session_id');
  const caseId = searchParams.get('case_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setError("Payment ID is missing from the URL parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get token from local storage
        const token = localStorage.getItem('usertoken') || localStorage.getItem('advtoken');
        
        // Verify the payment with your backend
        const response = await axios.post(
          `http://localhost:8080/api/payment/success/${paymentId}`,
          {
            sessionId: sessionId,
            caseId: caseId,
            paymentId: paymentId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success) {
          console.log("Payment verification successful:", response.data);
          setPaymentDetails(response.data.payment);
        } else {
          throw new Error(response.data?.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err.response?.data?.message || err.message || "An error occurred while verifying the payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, sessionId, caseId]);

  const handleBackToPayments = () => {
    // Determine where to navigate based on user type
    const isAdvocate = !!localStorage.getItem('advtoken');
    if (isAdvocate) {
      navigate('/advocatedash');
    } else {
      navigate('/userdash');
    }
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {loading ? (
              <div className="card shadow-lg border-0 rounded-lg p-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="mb-3">Verifying Payment</h3>
                <p className="text-muted">Please wait while we verify your payment...</p>
              </div>
            ) : error ? (
              <div className="card shadow-lg border-0 rounded-lg p-5">
                <div className="text-center text-danger mb-4">
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "4rem" }}></i>
                </div>
                <h3 className="text-center mb-4">Payment Verification Failed</h3>
                <div className="alert alert-danger mb-4">{error}</div>
                <p className="text-center mb-4">
                  We encountered an issue while verifying your payment. This could be due to:
                </p>
                <ul className="mb-4">
                  <li>Invalid or expired payment session</li>
                  <li>Payment was canceled or rejected</li>
                  <li>Network or server connectivity issues</li>
                </ul>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-outline-secondary" onClick={handleBackToPayments}>
                    Back to Dashboard
                  </button>
                  <button className="btn btn-primary" onClick={handleTryAgain}>
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="card shadow-lg border-0 rounded-lg p-5">
                <div className="text-center text-success mb-4">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "4rem" }}></i>
                </div>
                <h2 className="text-center mb-4">Payment Successful!</h2>
                <div className="card bg-light p-4 mb-4">
                  <div className="row mb-2">
                    <div className="col-5 fw-bold">Payment ID:</div>
                    <div className="col-7">{paymentDetails?._id || paymentId}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 fw-bold">Amount:</div>
                    <div className="col-7">₹{paymentDetails?.amount || "N/A"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 fw-bold">Payment Type:</div>
                    <div className="col-7">{paymentDetails?.type || "N/A"}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 fw-bold">Date:</div>
                    <div className="col-7">
                      {paymentDetails?.payment_date 
                        ? new Date(paymentDetails.payment_date).toLocaleString() 
                        : new Date().toLocaleString()}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5 fw-bold">Status:</div>
                    <div className="col-7">
                      <span className="badge bg-success">Completed</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="mb-4">
                    Thank you for your payment. A confirmation has been sent to your email address.
                  </p>
                  <button 
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleBackToPayments}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
