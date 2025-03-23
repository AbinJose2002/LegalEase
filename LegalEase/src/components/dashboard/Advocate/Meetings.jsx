import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const advToken = localStorage.getItem('advocatetoken');
                const response = await axios.post('http://localhost:8080/api/consultations/advocate-meetings', 
                    { token: advToken }
                );
                
                if (response.data.success === "true") {
                    setMeetings(response.data.meetings);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch meetings');
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    if (loading) return <div>Loading meetings...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <h2>Scheduled Meetings</h2>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Client Name</th>
                            <th>Case Title</th>
                            <th>Meeting Link</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No meetings scheduled</td>
                            </tr>
                        ) : (
                            meetings.map((meeting) => (
                                <tr key={meeting._id}>
                                    <td>{new Date(meeting.date).toLocaleDateString()}</td>
                                    <td>{meeting.timeSlot}</td>
                                    <td>{`${meeting.clientDetails?.firstName} ${meeting.clientDetails?.lastName}`}</td>
                                    <td>{meeting.caseDetails?.case_title}</td>
                                    <td>
                                        {meeting.meetingLink ? (
                                            <a 
                                                href={meeting.meetingLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn btn-primary btn-sm"
                                            >
                                                Join Meeting
                                            </a>
                                        ) : (
                                            "Not available"
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge bg-${meeting.status === 'Scheduled' ? 'success' : 'warning'}`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
