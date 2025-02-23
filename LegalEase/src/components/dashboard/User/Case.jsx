import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        console.log(response.data.clients)
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Case Details</h2>
      <p>*A case In Progress need to pay for opening the case</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Number</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Title</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Description</th>
            {/* <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Client Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Client Phone</th> */}
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Case Status</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Payment</th>
          </tr>
        </thead>
        <tbody>
          {clientDetails
            .map(client => (
              <tr key={client._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{client.case_id}</td>
                <td style={{ padding: '10px' }}>{client.case_title}</td>
                <td style={{ padding: '10px' }}>{client.case_description}</td>
                {/* <td style={{ padding: '10px' }}>{`${client.userDetails.firstName} ${client.userDetails.lastName}`}</td> */}
                {/* <td style={{ padding: '10px' }}>{client.userDetails.phone}</td> */}
                <td style={{ padding: '10px' }}>
                  {client.status}{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor:
                        client.status === "Not Approved" ? "red" :
                          client.status === "Open" ? "green" :
                            client.status === "In Progress" ? "orange" :
                              client.status === "Closed" ? "blue" : "gray"
                    }}
                  ></span>
                </td>
                <td style={{ padding: '10px' }}>{client.status === 'In Progress' ? <button className='btn btn-success' onClick={() => { payMethod(client.advocate_id, client._id ) }}>Pay Now</button>: <button className="btn btn-primary">No Payment Due</button> }</td>


              </tr>
            ))}

        </tbody>

      </table>

    </div>
  );
}