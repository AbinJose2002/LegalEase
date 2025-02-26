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

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const advToken = localStorage.getItem('advocatetoken');
        if (!advToken) {
          setError('No advocate token found. Please log in.');
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

    try {
      const res = await axios.post("http://localhost:8080/api/payment/fetch-case", { selectedCaseId });
      setPayments(res.data.payments);
    } catch (error) {
      console.log(error);
      setPayments([]);
    }
  };

  const handleAddPayment = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/payment/add", {
        case_id: selectedCase,
        type: paymentType,
        amount
      });

      setPayments([...payments, res.data.payment]); // Update UI with new payment
      setShowPaymentForm(false); // Close form
      setAmount(""); // Reset amount field
    } catch (error) {
      console.log(error);
      alert("Failed to add payment");
    }
  };

  return (
    <div>
      <h2>Payment</h2>

      {loading && <p>Loading cases...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <select className="form-select mb-3" aria-label="Select a case" onChange={handleChange}>
        <option value="">Select a case</option>
        {cases.map((caseItem) => (
          <option key={caseItem._id} value={caseItem._id}>
            {caseItem.case_title} - {caseItem.userDetails.firstName} {caseItem.userDetails.lastName}
          </option>
        ))}
      </select>

      {selectedCase && (
        <button className="btn btn-primary mb-3" onClick={() => setShowPaymentForm(true)}>+ Add Payment</button>
      )}

      {showPaymentForm && (
        <div className="border p-3 mb-3">
          <h4>Add Payment</h4>
          <label>Payment Type:</label>
          <select className="form-select mb-2" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <option value="advance">Advance</option>
            <option value="Sitting">Sitting</option>
          </select>
          <label>Amount:</label>
          <input type="number" className="form-control mb-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className="btn btn-success" onClick={handleAddPayment}>Submit Payment</button>
          <button className="btn btn-secondary ms-2" onClick={() => setShowPaymentForm(false)}>Cancel</button>
        </div>
      )}

      {selectedCase && <h3>Payments for Case: {selectedCase}</h3>}

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
                <td>${payment.amount}</td>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>{payment.status === "Completed" ? 
                  <button className='btn btn-success disabled'>Paid</button> :
                  <button className='btn btn-danger disabled'>Not Paid</button>}
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
