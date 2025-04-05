import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaseDebug = () => {
    const [endpoints, setEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize with standard endpoints to try
        setEndpoints([
            '/api/case/user',
            '/api/cases/user',
            '/api/user/cases',
            '/api/user/case',
            '/api/cases',
            '/api/case'
        ]);
        setLoading(false);
    }, []);

    const handleTestEndpoint = async (endpoint) => {
        setSelectedEndpoint(endpoint);
        setError(null);
        setResponse(null);
        
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                setError("No auth token found");
                return;
            }

            const response = await axios.get(`http://localhost:8080${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setResponse(response.data);
        } catch (err) {
            setError(err.response?.data || err.message);
        }
    };

    const handleAddEndpoint = (event) => {
        event.preventDefault();
        const input = document.getElementById('new-endpoint');
        const newEndpoint = input.value.trim();
        
        if (newEndpoint && !endpoints.includes(newEndpoint)) {
            setEndpoints([...endpoints, newEndpoint]);
            input.value = '';
        }
    };

    return (
        <div className="endpoint-debugger p-3 bg-light border rounded">
            <h4 className="mb-3">API Endpoint Debugger</h4>
            
            <div className="mb-4">
                <form onSubmit={handleAddEndpoint} className="d-flex mb-2">
                    <input 
                        type="text" 
                        id="new-endpoint"
                        className="form-control me-2" 
                        placeholder="/api/your/endpoint" 
                    />
                    <button type="submit" className="btn btn-outline-primary">Add</button>
                </form>
                
                <div className="list-group">
                    {endpoints.map((endpoint, index) => (
                        <button
                            key={index}
                            className={`list-group-item list-group-item-action ${selectedEndpoint === endpoint ? 'active' : ''}`}
                            onClick={() => handleTestEndpoint(endpoint)}
                        >
                            {endpoint}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-center">Loading endpoints...</p>}
            
            {selectedEndpoint && (
                <div className="mt-3">
                    <h5>Testing: {selectedEndpoint}</h5>
                    
                    {error && (
                        <div className="alert alert-danger">
                            <pre style={{margin: 0}}>{JSON.stringify(error, null, 2)}</pre>
                        </div>
                    )}
                    
                    {response && (
                        <div className="alert alert-success">
                            <pre style={{margin: 0}}>{JSON.stringify(response, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CaseDebug;
