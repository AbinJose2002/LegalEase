import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from 'react-bootstrap';

export default function Documents() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState("");
    const [documents, setDocuments] = useState([]);

    useEffect(() => {

        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const token = localStorage.getItem("usertoken"); // Fetch user token
            const response = await axios.get("http://localhost:8080/api/case/user/cases", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCases(response.data.cases)
        } catch (error) {
            console.error("Error fetching cases:", error);
        }
    };

    const fetchDocuments = async (caseId) => {
        setSelectedCase(caseId);
        try {
            const response = await axios.get(`http://localhost:8080/api/case/user/documents/${caseId}`);
            setDocuments(response.data.documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const downloadFile = (fileUrl, fileName) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mt-4">
            <h2>View Case Documents</h2>

            {/* Case Selection Dropdown */}
            <select className="form-select mb-3" onChange={(e) => fetchDocuments(e.target.value)}>
                <option value="">Select a case</option>
                {cases.map((c) => (
                    <option key={c._id} value={c._id}>{c.case_title}</option>
                ))}
            </select>

            {/* Display Documents */}
            {selectedCase && (
                <div>
                    <h3>Documents for Selected Case</h3>
                    {documents.length === 0 ? (
                        <p>No documents available for this case.</p>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc._id} className="mb-3">
                                <strong>{doc.name}</strong> 
                                <a href={`http://localhost:8080${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary ms-2">
                                    Open Document
                                </a>
                                <Button variant="warning" className="ms-2" onClick={() => downloadFile(`http://localhost:8080${doc.fileUrl}`, doc.name)}>
                                    Download
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
