import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Client() {
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseNum, setCaseNum] = useState('');
  const [enteredCaseNumber, setEnteredCaseNumber] = useState(''); // Add this new state

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const advToken = localStorage.getItem('advocatetoken');
        const response = await axios.post('http://localhost:8080/api/case/view', { advToken })
        setClientDetails(response.data.clients);
        // console.log(response.data.clients)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
    // console.log(caseNum)
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const confirmCase = async (caseNum, case_id) => {
    if (!case_id) {
        alert("Please enter a valid case number");
        return;
    }
    try {
        const res = await axios.post('http://localhost:8080/api/case/confirm', { 
            caseNum, 
            case_id 
        });
        if (res.data.success === "true") {
            alert("Case confirmed successfully");
            window.location.reload();
        }
    } catch (error) {
        console.log(error);
        alert("Error confirming case");
    }
  }

  const rejectCase = async (caseNum) => {
    try {
      const res = await axios.post('http://localhost:8080/api/case/reject', { caseNum })
      if (res.status) {
        alert("Rejected Case")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h2>Client Details</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Number</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Title</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Description</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Client Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Client Phone</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Operation</th>
          </tr>
        </thead>
        <tbody>
          {clientDetails
            .filter(client => client.status === 'Not Approved') // Filter clients
            .map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{client.case_id}</td>
                <td style={{ padding: '10px' }}>{client.case_title}</td>
                <td style={{ padding: '10px' }}>{client.case_description}</td>
                <td style={{ padding: '10px' }}>{`${client.userDetails.firstName} ${client.userDetails.lastName}`}</td>
                <td style={{ padding: '10px' }}>{client.userDetails.phone}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    type='button'
                    onClick={() => setCaseNum(client)}
                    className="mx-2 btn btn-success"
                    data-bs-toggle="modal"
                    data-bs-target='#confirmModal'
                  >
                    Confirm
                  </button>
                  <button
                    type='button'
                    onClick={() => setCaseNum(client)}
                    className="mx-2 btn btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target='#rejectModal'
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}

        </tbody>

      </table>

      <div className="modal fade" id="confirmModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <h5>Case Details</h5>
              <p>Case Title: {caseNum.case_title}</p>
              <p>Case Description: {caseNum.case_description}</p>
              
              <div className="form-group mt-3">
                <label htmlFor="case_number" className="form-label">Assign Case Number</label>
                <div className="input-group">
                    <span className="input-group-text">CASE</span>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="case_number"
                        name="case_number"
                        placeholder="Enter case number (e.g., 2023001)"
                        value={enteredCaseNumber}
                        onChange={(e) => setEnteredCaseNumber(e.target.value)}
                        required
                    />
                </div>
                <small className="text-muted">Format: CASE will be prefixed automatically</small>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={() => confirmCase(caseNum._id, `CASE${enteredCaseNumber}`)}
              >
                Confirm Case
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="rejectModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <p>Are you sure to reject this case?</p>
              <p>Case Number: {caseNum.case_id}</p>
              <p>Case Number: {caseNum.case_title}</p>
              <p>Case Number: {caseNum.case_description}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-danger" onClick={() => { rejectCase(caseNum._id);  }}>Reject Case</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}