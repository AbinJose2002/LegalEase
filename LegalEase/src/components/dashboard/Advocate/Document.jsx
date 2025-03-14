import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from 'react-bootstrap';

export default function Document() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState("");
    const [documents, setDocuments] = useState([]);
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [newName, setNewName] = useState("");
    const [renameId, setRenameId] = useState(null);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const token = localStorage.getItem("advocatetoken");
            const response = await axios.get("http://localhost:8080/api/documents/cases", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCases(response.data.cases);
            console.log(response.data.cases)
        } catch (error) {
            console.error("Error fetching cases:", error);
        }
    };

    const fetchDocuments = async (caseId) => {
        setSelectedCase(caseId);
        try {
            const response = await axios.get(`http://localhost:8080/api/documents/${caseId}`);
            setDocuments(response.data.documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("caseId", selectedCase);
        formData.append("file", file);

        try {
            const token = localStorage.getItem("advocatetoken");
            await axios.post("http://localhost:8080/api/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
            });
            fetchDocuments(selectedCase);
            setName("");
            setFile(null);
        } catch (error) {
            console.error("Error uploading document:", error);
        }
    };

    const handleDelete = async (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await axios.delete(`http://localhost:8080/api/documents/${docId}`);
                fetchDocuments(selectedCase);
            } catch (error) {
                console.error("Error deleting document:", error);
            }
        }
    };

    const handleRename = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/documents/${renameId}`, { name: newName });
            fetchDocuments(selectedCase);
            setRenameId(null);
            setNewName("");
        } catch (error) {
            console.error("Error renaming document:", error);
        }
    };

    const openModal = (fileUrl) => {
        setSelectedImage(fileUrl);
        setShowModal(true);
    };

    return (
        <div className="container mt-4">
            <h2>Manage Case Documents</h2>

            <select className="form-select mb-3" onChange={(e) => fetchDocuments(e.target.value)}>
                <option value="">Select a case</option>
                {cases.map((c) => (
                    <option key={c._id} value={c._id}>{c.case_title}</option>
                ))}
            </select>

            {selectedCase && (
                <form onSubmit={handleUpload} className="mb-4">
                    <input type="text" className="form-control mb-2" placeholder="Document Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} required />
                    <button type="submit" className="btn btn-primary">Upload Document</button>
                </form>
            )}

            <h3>Uploaded Documents</h3>
            {documents.map((doc) => (
                <div key={doc._id} className="mb-3">
                    <strong>{doc.name}</strong> 
                    {doc.fileUrl.match(/\.(jpeg|jpg|png|gif)$/) ? (
                        <Button variant="success" className="ms-2" onClick={() => openModal(`http://localhost:8080${doc.fileUrl}`)}>
                            View Image
                        </Button>
                    ) : (
                        <a href={`http://localhost:8080${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary ms-2">
                            Open Document
                        </a>
                    )}
                    <Button variant="danger" className="ms-2" onClick={() => handleDelete(doc._id)}>
                        Delete
                    </Button>
                    <Button variant="warning" className="ms-2" onClick={() => setRenameId(doc._id)}>
                        Rename
                    </Button>
                </div>
            ))}

            {renameId && (
                <form onSubmit={handleRename} className="mt-3">
                    <input type="text" className="form-control mb-2" placeholder="New Document Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                    <button type="submit" className="btn btn-success">Save Name</button>
                </form>
            )}

            {/* Bootstrap Modal for Image Preview */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Document Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <img src={selectedImage} alt="Preview" className="img-fluid" />
                </Modal.Body>
            </Modal>
        </div>
    );
}
