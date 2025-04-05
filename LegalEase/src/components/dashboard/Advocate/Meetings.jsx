import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/animations.css';
import '../../../styles/meetings.css';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [expandedMeeting, setExpandedMeeting] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const advToken = localStorage.getItem('advocatetoken');
                const response = await axios.post('http://localhost:8080/api/consultations/advocate-meetings', 
                    { token: advToken }
                );
                
                if (response.data.success === "true") {
                    // Sort meetings by date (newest first)
                    const sortedMeetings = response.data.meetings.sort((a, b) => 
                        new Date(a.date) - new Date(b.date)
                    );
                    setMeetings(sortedMeetings);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch meetings');
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    const handleExpandMeeting = (meetingId) => {
        if (expandedMeeting === meetingId) {
            setExpandedMeeting(null);
        } else {
            setExpandedMeeting(meetingId);
        }
    };

    const filteredMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filter === 'all') return true;
        if (filter === 'upcoming') return meetingDate >= today;
        if (filter === 'today') return meetingDate.toDateString() === today.toDateString();
        if (filter === 'past') return meetingDate < today;
        
        return true;
    });

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading meetings...</span>
            </div>
            <span className="ms-3">Loading your scheduled meetings...</span>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
            <div>
                <strong>Error:</strong> {error}
                <p className="mb-0 mt-2">Please try refreshing the page or contact support.</p>
            </div>
        </div>
    );

    const getUpcomingCount = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return meetings.filter(m => new Date(m.date) >= today).length;
    };

    const getTodayCount = () => {
        const today = new Date();
        return meetings.filter(m => new Date(m.date).toDateString() === today.toDateString()).length;
    };

    return (
        <div className="meetings-dashboard fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 mb-0 fw-bold">
                    <i className="bi bi-calendar-check me-2 text-primary"></i>
                    Meetings & Consultations
                </h2>
                
                <div className="btn-group filter-controls">
                    <button 
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('today')}
                    >
                        Today
                        {getTodayCount() > 0 && (
                            <span className="badge bg-danger ms-2">{getTodayCount()}</span>
                        )}
                    </button>
                    <button 
                        className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                        {getUpcomingCount() > 0 && (
                            <span className="badge bg-light text-dark ms-2">{getUpcomingCount()}</span>
                        )}
                    </button>
                    <button 
                        className={`btn ${filter === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                </div>
            </div>

            {/* Meeting Stats */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div className="ms-3">
                                    <h5 className="stat-value">{meetings.length}</h5>
                                    <p className="stat-label">Total Meetings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                                    <i className="bi bi-calendar-day"></i>
                                </div>
                                <div className="ms-3">
                                    <h5 className="stat-value">{getTodayCount()}</h5>
                                    <p className="stat-label">Today's Meetings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon bg-success bg-opacity-10 text-success">
                                    <i className="bi bi-calendar-plus"></i>
                                </div>
                                <div className="ms-3">
                                    <h5 className="stat-value">{getUpcomingCount()}</h5>
                                    <p className="stat-label">Upcoming Meetings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon bg-info bg-opacity-10 text-info">
                                    <i className="bi bi-people"></i>
                                </div>
                                <div className="ms-3">
                                    <h5 className="stat-value">
                                        {new Set(meetings.map(m => 
                                            `${m.clientDetails?.firstName} ${m.clientDetails?.lastName}`
                                        )).size}
                                    </h5>
                                    <p className="stat-label">Unique Clients</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting List */}
            {filteredMeetings.length === 0 ? (
                <div className="card border-0 shadow-sm text-center p-5 bg-light">
                    <div className="py-5">
                        <i className="bi bi-calendar2-x text-muted" style={{fontSize: '4rem'}}></i>
                        <h4 className="mt-3">No Meetings Found</h4>
                        <p className="text-muted mb-0">
                            {filter === 'upcoming' ? 
                                "You don't have any upcoming meetings scheduled." :
                                filter === 'today' ?
                                "You don't have any meetings scheduled for today." :
                                filter === 'past' ?
                                "You don't have any past meetings." :
                                "You don't have any meetings scheduled."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {filteredMeetings.map((meeting, index) => {
                        const meetingDate = new Date(meeting.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const isToday = meetingDate.toDateString() === today.toDateString();
                        const isPast = meetingDate < today;
                        
                        return (
                            <div key={meeting._id || index} className="col-lg-6 mb-4">
                                <div 
                                    className={`meeting-card card border-0 shadow-sm ${
                                        isToday ? 'border-left-warning' : 
                                        isPast ? 'border-left-secondary' : 
                                        'border-left-primary'
                                    }`}
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <div 
                                        className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center"
                                        onClick={() => handleExpandMeeting(meeting._id)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className={`meeting-calendar me-3 text-center ${
                                                isToday ? 'bg-warning text-dark' : 
                                                isPast ? 'bg-secondary text-white' : 
                                                'bg-primary text-white'
                                            }`}>
                                                <div className="cal-month">{meetingDate.toLocaleString('default', { month: 'short' })}</div>
                                                <div className="cal-day">{meetingDate.getDate()}</div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1 meeting-title">
                                                    {meeting.clientDetails ? 
                                                        `${meeting.clientDetails.firstName} ${meeting.clientDetails.lastName}` : 
                                                        'Client Meeting'}
                                                </h5>
                                                <p className="mb-0 small text-muted">
                                                    <i className="bi bi-clock me-1"></i> {meeting.timeSlot}
                                                    {meeting.caseDetails && (
                                                        <>
                                                            <span className="mx-2">•</span>
                                                            <i className="bi bi-briefcase me-1"></i> 
                                                            {meeting.caseDetails.case_title || 'Case consultation'}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`status-indicator badge ${
                                                isToday ? 'bg-warning text-dark' : 
                                                isPast ? 'bg-secondary' : 
                                                'bg-primary'
                                            }`}>
                                                <i className={`bi me-1 ${
                                                    isToday ? 'bi-alarm' : 
                                                    isPast ? 'bi-check-circle' : 
                                                    'bi-calendar-event'
                                                }`}></i>
                                                {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {expandedMeeting === meeting._id && (
                                        <div className="card-body border-top slide-in-bottom">
                                            <div className="row">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <h6 className="text-muted small text-uppercase mb-2">Client Details</h6>
                                                    <div className="p-3 bg-light rounded">
                                                        <div className="d-flex align-items-center mb-2">
                                                            {/* <div className="avatar bg-primary text-white rounded-circle me-2">
                                                                <i className="bi bi-person"></i>
                                                            </div> */}
                                                            <div>
                                                                <p className="mb-0 fw-medium">
                                                                    {meeting.clientDetails ? 
                                                                        `${meeting.clientDetails.firstName} ${meeting.clientDetails.lastName}` : 
                                                                        'Unknown Client'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {meeting.clientDetails && (
                                                            <div className="mt-2 small">
                                                                {meeting.clientDetails.phone && (
                                                                    <div className="mb-1">
                                                                        <i className="bi bi-telephone me-2"></i>
                                                                        {meeting.clientDetails.phone}
                                                                    </div>
                                                                )}
                                                                {meeting.clientDetails.email && (
                                                                    <div>
                                                                        <i className="bi bi-envelope me-2"></i>
                                                                        {meeting.clientDetails.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="col-md-6">
                                                    <h6 className="text-muted small text-uppercase mb-2">Meeting Details</h6>
                                                    <div className="p-3 bg-light rounded mb-3">
                                                        <div className="meeting-details-grid">
                                                            <div className="mb-2">
                                                                <span className="text-muted small d-block">Date:</span>
                                                                <span>{meetingDate.toLocaleDateString('en-US', {
                                                                    weekday: 'long', 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric'
                                                                })}</span>
                                                            </div>
                                                            <div className="mb-2">
                                                                <span className="text-muted small d-block">Time:</span>
                                                                <span>{meeting.timeSlot}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted small d-block">Status:</span>
                                                                <span className={`badge ${
                                                                    meeting.status === 'Scheduled' ? 'bg-success' : 'bg-warning'
                                                                }`}>
                                                                    {meeting.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {meeting.meetingLink ? (
                                                        <a 
                                                            href={meeting.meetingLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="btn btn-primary d-block mb-2"
                                                        >
                                                            <i className="bi bi-camera-video me-2"></i>
                                                            Join Video Conference
                                                        </a>
                                                    ) : (
                                                        <button className="btn btn-outline-secondary w-100 mb-2" disabled>
                                                            <i className="bi bi-link-45deg me-2"></i>
                                                            No meeting link available
                                                        </button>
                                                    )}
                                                    
                                                    {/* <button className="btn btn-sm btn-outline-secondary w-100">
                                                        <i className="bi bi-pencil me-1"></i> Edit Meeting
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
