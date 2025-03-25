import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/animations.css';

export default function Case() {
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseNum, setCaseNum] = useState('')

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const advToken = localStorage.getItem('usertoken');
        const response = await axios.post('http://localhost:8080/api/case/view-user', { advToken })
        setClientDetails(response.data.clients);
        // console.log(response.data.clients)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, []);

  const payMethod = async (advocate_id, case_id) => {
    try {
      // const fee = 200
      const res = await axios.post('http://localhost:8080/api/payment/advance',{advocate_id,case_id})
      // console.log(res.data.url)
      window.location.href = res.data.url
    } catch (error) {
      console.log(error)
    }
  }

  const LoadingSpinner = () => (
    <div className="text-center p-5 fade-in">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger fade-in">{error}</div>;

  return (
    <div className="case-container fade-in">
      <div className="case-header mb-4 slide-in-top">
        <h2 className="gradient-text display-6 fw-bold">Case Details</h2>
        <div className="alert alert-info border-start border-info border-5">
          <i className="fas fa-info-circle me-2 fa-lg"></i>
          Cases marked as "In Progress" require payment to proceed
        </div>
      </div>

      <div className="table-responsive card shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr className="text-muted">
              <th className="fw-semibold">Case Number</th>
              <th className="fw-semibold">Title</th>
              <th className="fw-semibold">Description</th>
              <th className="fw-semibold">Status</th>
              <th className="fw-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {clientDetails.map((client, index) => (
              <tr 
                key={client._id}
                className="slide-in-right"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: client.status === 'In Progress' ? 'rgba(255, 243, 205, 0.2)' : 'transparent',
                  transition: 'transform 0.2s ease, background-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                <td className="font-monospace text-primary">{client.case_id}</td>
                <td className="fw-semibold">{client.case_title}</td>
                <td>
                  <div className="text-truncate" style={{maxWidth: '200px'}}>
                    {client.case_description}
                  </div>
                </td>
                <td>
                  <span className={`badge rounded-pill bg-${
                    client.status === 'Not Approved' ? 'danger' :
                    client.status === 'Open' ? 'success' :
                    client.status === 'In Progress' ? 'warning' :
                    'info'
                  } pulse shadow-sm`}>
                    <i className={`fas fa-${
                      client.status === 'Not Approved' ? 'times-circle' :
                      client.status === 'Open' ? 'check-circle' :
                      client.status === 'In Progress' ? 'clock' :
                      'info-circle'
                    } me-1`}></i>
                    {client.status}
                  </span>
                </td>
                <td>
                  {client.status === 'In Progress' ? (
                    <button 
                      className="btn btn-primary btn-sm hover-lift"
                      style={{
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      onClick={() => payMethod(client.advocate_id, client._id)}>
                      <i className="fas fa-credit-card me-2"></i>
                      Pay Now
                    </button>
                  ) : (
                    <button className="btn btn-light btn-sm disabled text-muted">
                      <i className="fas fa-check-circle me-2"></i>
                      No Payment Due
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clientDetails.length === 0 && (
        <div className="text-center p-5 mt-4 card shadow-sm border-0 fade-in">
          <i className="fas fa-folder-open fa-3x text-muted mb-3 animate-pulse"></i>
          <h5 className="text-muted">No cases found</h5>
          <p className="text-muted small">Your cases will appear here once they are created</p>
        </div>
      )}
    </div>
  );
}