import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: [],
        advocates: [],
        cases: []
    });

    useEffect(() => {
        if (!localStorage.getItem('adminToken')) {
            navigate('/admin/login');
            return;
        }
        
        fetchDashboardData();
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [users, advocates, cases] = await Promise.all([
                axios.get('http://localhost:8080/api/user/', { headers }),
                axios.get('http://localhost:8080/api/advocate/', { headers }),
                axios.get('http://localhost:8080/api/case/', { headers })
            ]);

            setStats({
                users: users.data.data || [],
                advocates: advocates.data.advocates || [],
                cases: cases.data.data || []
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Add more detailed error handling
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => (
        <div className="row g-4 animate__animated animate__fadeIn">
            <div className="col-md-3">
                <div className="card bg-primary text-white h-100 transition-all hover-shadow">
                    <div className="card-body">
                        <h5 className="card-title">Total Users</h5>
                        <h2 className="mb-0">{stats.users.length}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card bg-success text-white h-100 transition-all hover-shadow">
                    <div className="card-body">
                        <h5 className="card-title">Total Advocates</h5>
                        <h2 className="mb-0">{stats.advocates.length}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card bg-warning text-white h-100 transition-all hover-shadow">
                    <div className="card-body">
                        <h5 className="card-title">Active Cases</h5>
                        <h2 className="mb-0">
                            {stats.cases.filter(c => c.status === 'Open').length}
                        </h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card bg-info text-white h-100 transition-all hover-shadow">
                    <div className="card-body">
                        <h5 className="card-title">Case Distribution</h5>
                        <div style={{ height: '150px' }}>
                            <Bar 
                                data={{
                                    labels: ['Open', 'In Progress', 'Not Approved', 'Closed'],
                                    datasets: [{
                                        label: 'Cases',
                                        data: [
                                            stats.cases.filter(c => c.status === 'Open').length,
                                            stats.cases.filter(c => c.status === 'In Progress').length,
                                            stats.cases.filter(c => c.status === 'Not Approved').length,
                                            stats.cases.filter(c => c.status === 'Closed').length
                                        ],
                                        backgroundColor: [
                                            'rgba(255, 255, 255, 0.8)',
                                            'rgba(255, 255, 255, 0.6)',
                                            'rgba(255, 255, 255, 0.4)',
                                            'rgba(255, 255, 255, 0.2)'
                                        ]
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                                color: 'white'
                                            },
                                            grid: { display: false }
                                        },
                                        x: {
                                            ticks: {
                                                color: 'white',
                                                font: { size: 10 }
                                            },
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="col-md-8">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">Recent Case Activities</h5>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Case ID</th>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.cases.slice(0, 5).map(caseItem => (
                                        <tr key={caseItem._id}>
                                            <td>{caseItem.case_id}</td>
                                            <td>{caseItem.case_title}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    caseItem.status === 'Open' ? 'success' : 
                                                    caseItem.status === 'Not Approved' ? 'warning' : 
                                                    'primary'
                                                }`}>
                                                    {caseItem.status}
                                                </span>
                                            </td>
                                            <td>{new Date(caseItem.updatedAt || caseItem.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="col-md-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">Statistics Summary</h5>
                        <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                Case Success Rate
                                <span className="badge bg-success rounded-pill">
                                    {((stats.cases.filter(c => c.status === 'Closed').length / stats.cases.length) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                Pending Cases
                                <span className="badge bg-warning rounded-pill">
                                    {stats.cases.filter(c => c.status === 'Not Approved').length}
                                </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                Advocate Verification Rate
                                <span className="badge bg-info rounded-pill">
                                    {((stats.advocates.filter(a => a.verified).length / stats.advocates.length) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                Average Cases per Advocate
                                <span className="badge bg-primary rounded-pill">
                                    {(stats.cases.length / (stats.advocates.length || 1)).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="card animate__animated animate__fadeIn">
            <div className="card-body">
                <h5 className="card-title">Users Management</h5>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.users.map(user => (
                                <tr key={user._id} className="align-middle">
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="badge bg-success">Active</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                                        <button className="btn btn-sm btn-outline-danger">Disable</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAdvocates = () => (
        <div className="card animate__animated animate__fadeIn">
            <div className="card-body">
                <h5 className="card-title">Advocates Management</h5>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.advocates.map(advocate => (
                                <tr key={advocate._id} className="align-middle">
                                    <td>{advocate.firstName} {advocate.lastName}</td>
                                    <td>{advocate.email}</td>
                                    <td>{advocate.phone}</td>
                                    <td>
                                        <span className={`badge bg-${advocate.verified ? 'success' : 'warning'}`}>
                                            {advocate.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                                        <button className="btn btn-sm btn-outline-warning">
                                            {advocate.verified ? 'Revoke' : 'Verify'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCases = () => (
        <div className="card animate__animated animate__fadeIn">
            <div className="card-body">
                <h5 className="card-title">Cases Management</h5>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Case ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Client ID</th>
                                <th>Advocate ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.cases.map(caseItem => (
                                <tr key={caseItem._id} className="align-middle">
                                    <td>{caseItem.case_id}</td>
                                    <td>{caseItem.case_title}</td>
                                    <td>
                                        <span className={`badge bg-${
                                            caseItem.status === 'Open' ? 'success' : 
                                            caseItem.status === 'Not Approved' ? 'warning' : 
                                            'primary'
                                        }`}>
                                            {caseItem.status}
                                        </span>
                                    </td>
                                    <td>{caseItem.client_id}</td>
                                    <td>{caseItem.advocate_id}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                                        <button className="btn btn-sm btn-outline-danger">Close</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const getUserGrowthData = (users) => {
        const monthlyData = new Array(6).fill(0);
        users.forEach(user => {
            const createdDate = new Date(user.createdAt);
            const monthDiff = new Date().getMonth() - createdDate.getMonth();
            if (monthDiff >= 0 && monthDiff < 6) {
                monthlyData[5 - monthDiff]++;
            }
        });
        return monthlyData;
    };

    const getCaseCategories = (cases) => {
        const categories = {
            Civil: 0,
            Criminal: 0,
            Family: 0,
            Corporate: 0
        };

        cases.forEach(caseItem => {
            // Assuming case_title contains category information
            if (caseItem.case_title?.toLowerCase().includes('civil')) categories.Civil++;
            else if (caseItem.case_title?.toLowerCase().includes('criminal')) categories.Criminal++;
            else if (caseItem.case_title?.toLowerCase().includes('family')) categories.Family++;
            else if (caseItem.case_title?.toLowerCase().includes('corporate')) categories.Corporate++;
        });

        return Object.values(categories);
    };

    const renderAnalytics = () => (
        <div className="row g-4 animate__animated animate__fadeIn">
            {/* First Row - 4 Small Charts */}
            <div className="col-md-3">
                <div className="card h-100">
                    <div className="card-body">
                        <h6 className="card-title">Case Distribution</h6>
                        <div style={{ height: '200px' }}>
                            <Pie
                                data={{
                                    labels: ['Open', 'In Progress', 'Not Approved', 'Closed'],
                                    datasets: [{
                                        data: [
                                            stats.cases.filter(c => c.status === 'Open').length,
                                            stats.cases.filter(c => c.status === 'In Progress').length,
                                            stats.cases.filter(c => c.status === 'Not Approved').length,
                                            stats.cases.filter(c => c.status === 'Closed').length
                                        ],
                                        backgroundColor: [
                                            'rgba(40, 167, 69, 0.8)',
                                            'rgba(0, 123, 255, 0.8)',
                                            'rgba(255, 193, 7, 0.8)',
                                            'rgba(220, 53, 69, 0.8)'
                                        ]
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card h-100">
                    <div className="card-body">
                        <h6 className="card-title">Advocate Status</h6>
                        <div style={{ height: '200px' }}>
                            <Doughnut
                                data={{
                                    labels: ['Verified', 'Pending'],
                                    datasets: [{
                                        data: [
                                            stats.advocates.filter(a => a.verified).length,
                                            stats.advocates.filter(a => !a.verified).length
                                        ],
                                        backgroundColor: [
                                            'rgba(40, 167, 69, 0.8)',
                                            'rgba(255, 193, 7, 0.8)'
                                        ]
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card h-100">
                    <div className="card-body">
                        <h6 className="card-title">User Growth</h6>
                        <div style={{ height: '200px' }}>
                            <Line
                                data={{
                                    labels: getLastSixMonths(),
                                    datasets: [{
                                        label: 'New Users',
                                        data: getUserGrowthData(stats.users),
                                        borderColor: 'rgb(75, 192, 192)',
                                        tension: 0.1,
                                        fill: true,
                                        backgroundColor: 'rgba(75, 192, 192, 0.1)'
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { 
                                        y: { 
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card h-100">
                    <div className="card-body">
                        <h6 className="card-title">Case Categories</h6>
                        <div style={{ height: '200px' }}>
                            <Bar
                                data={{
                                    labels: ['Civil', 'Criminal', 'Family', 'Corporate'],
                                    datasets: [{
                                        label: 'Cases',
                                        data: getCaseCategories(stats.cases),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.5)',
                                            'rgba(54, 162, 235, 0.5)',
                                            'rgba(255, 206, 86, 0.5)',
                                            'rgba(75, 192, 192, 0.5)'
                                        ]
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row - Statistics Cards */}
            <div className="col-md-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h6 className="card-title">Key Metrics</h6>
                        <div className="list-group list-group-flush">
                            {generateKeyMetrics().map((metric, index) => (
                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    {metric.label}
                                    <span className={`badge bg-${metric.color} rounded-pill`}>
                                        {metric.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const getLastSixMonths = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
        }
        return months;
    };

    const getMonthlyData = (cases) => {
        const monthlyData = new Array(6).fill(0);
        cases.forEach(case_item => {
            const caseDate = new Date(case_item.createdAt);
            const monthDiff = new Date().getMonth() - caseDate.getMonth();
            if (monthDiff >= 0 && monthDiff < 6) {
                monthlyData[5 - monthDiff]++;
            }
        });
        return monthlyData;
    };

    const generateKeyMetrics = () => [
        {
            label: 'Case Success Rate',
            value: `${((stats.cases.filter(c => c.status === 'Closed').length / stats.cases.length) * 100).toFixed(1)}%`,
            color: 'success'
        },
        {
            label: 'Advocate Verification Rate',
            value: `${((stats.advocates.filter(a => a.verified).length / stats.advocates.length) * 100).toFixed(1)}%`,
            color: 'primary'
        },
        {
            label: 'Average Cases per Advocate',
            value: (stats.cases.length / (stats.advocates.length || 1)).toFixed(1),
            color: 'info'
        },
        {
            label: 'Active Cases',
            value: stats.cases.filter(c => c.status === 'Open').length,
            color: 'warning'
        },
        {
            label: 'Total Users',
            value: stats.users.length,
            color: 'secondary'
        }
    ];

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center">
                        <h1 className="navbar-brand mb-0 h1">Admin Portal</h1>
                        <span className="text-light ms-3">{currentTime}</span>
                    </div>
                    <div className="d-flex align-items-center text-white">
                        <div className="text-end me-3">
                            <small>Welcome back,</small>
                            <p className="mb-0 fw-bold">{adminInfo?.name}</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('adminToken');
                                localStorage.removeItem('adminInfo');
                                navigate('/admin/login');
                            }}
                            className="btn btn-light"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 bg-white shadow-sm min-vh-100 p-0">
                        <div className="list-group list-group-flush">
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                Users
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'advocates' ? 'active' : ''}`}
                                onClick={() => setActiveTab('advocates')}
                            >
                                Advocates
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'cases' ? 'active' : ''}`}
                                onClick={() => setActiveTab('cases')}
                            >
                                Cases
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                Analytics
                            </button>
                        </div>
                    </div>

                    <div className="col-md-10 p-4">
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'users' && renderUsers()}
                                {activeTab === 'advocates' && renderAdvocates()}
                                {activeTab === 'cases' && renderCases()}
                                {activeTab === 'analytics' && renderAnalytics()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AdminDashboard as default };
