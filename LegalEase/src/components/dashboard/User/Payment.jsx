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
    <div>
      <h2>Payment</h2>

      {loading && <p>Loading cases...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <select className="form-select mb-3" aria-label="Select a case" onChange={handleChange}>
        <option value="">Select a case</option>
        {cases.map((caseItem) => (
          <option key={caseItem._id} value={caseItem._id}>
            {caseItem.case_title}
          </option>
        ))}
      </select>

      {selectedCase && (
        <div>
          <h3>Payments for Case: {selectedCase}</h3>
        </div>
      )}

      {payments.length > 0 ? (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment._id}>
                <td>{index + 1}</td>
                <td>{payment.type}</td>
                <td>{payment.status}</td>
                <td>{payment.amount}</td>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>
                  {payment.status === "Completed" ? 
                    <button className='btn btn-success disabled'>Paid</button> : 
                    <button className='btn btn-success' onClick={() => handlePay(payment._id)}>Pay Now</button>

                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        selectedCase && <p>No payments found for this case.</p>
      )}
    </div>
  );
}
