import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';

const PaymentFailed = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get('payment_id');
  const errorReason = searchParams.get('error') || 'The payment was not completed';

  useEffect(() => {
    const cancelPayment = async () => {
      if (!paymentId) {
        setError("Payment ID is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('usertoken') || localStorage.getItem('advtoken');
        
        // Call the API to cancel the payment
        await axios.post(
          `http://localhost:8080/api/payment/cancel/${paymentId}`,
          { reason: errorReason },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
      } catch (err) {
        console.error("Error cancelling payment:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    cancelPayment();
  }, [paymentId, errorReason]);

  const handleTryAgain = () => {
    // Navigate back to payments page
    const isAdvocate = !!localStorage.getItem('advtoken');
    if (isAdvocate) {
      navigate('/advocatedash');
    } else {
      navigate('/userdash');
    }
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
                <h3 className="mb-3">Processing Payment Result</h3>
                <p className="text-muted">Please wait while we process your payment result...</p>
              </div>
            ) : (
              <div className="card shadow-lg border-0 rounded-lg p-5">
                <div className="text-center text-danger mb-4">
                  <i className="bi bi-x-circle-fill" style={{ fontSize: "4rem" }}></i>
                </div>
                <h2 className="text-center mb-4">Payment Failed</h2>
                
                <div className="alert alert-danger mb-4">
                  {error || errorReason || "Your payment could not be processed."}
                </div>
                
                <p className="text-center mb-4">
                  We encountered an issue while processing your payment. This could be due to:
                </p>
                <ul className="mb-4">
                  <li>Insufficient funds in your account</li>
                  <li>Transaction was declined by your bank</li>
                  <li>Payment session expired</li>
                  <li>The payment was cancelled</li>
                </ul>
                
                <div className="text-center">
                  <button 
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleTryAgain}
                  >
                    Return to Dashboard
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

export default PaymentFailed;
