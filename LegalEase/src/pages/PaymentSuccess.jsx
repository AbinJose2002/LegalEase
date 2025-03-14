import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, Alert } from "react-bootstrap";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [meetingLink, setMeetingLink] = useState("");

    const consultationId = searchParams.get("consultationId");
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        if (!consultationId || !sessionId) {
            setError("Invalid payment confirmation details.");
            setLoading(false);
            return;
        }

        // ✅ Update the payment status & schedule the meeting
        const confirmPayment = async () => {
            try {
                const response = await axios.post("http://localhost:8080/api/consultations/schedule", { consultationId });

                setMeetingLink(response.data.meetingLink);
            } catch (error) {
                console.error("Error confirming payment:", error);
                setError("Payment confirmation failed.");
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
    }, [consultationId, sessionId]);

    return (
        <div className="container text-center mt-5">
            <h2>🎉 Payment Successful!</h2>

            {loading ? (
                <Spinner animation="border" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Alert variant="success">
                    <h4>✅ Your consultation is confirmed!</h4>
                    <p>Your video meeting has been scheduled.</p>
                    <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                        Join Meeting
                    </a>
                </Alert>
            )}

            <Button variant="primary" className="mt-3" onClick={() => navigate("/")}>
                Go to Home
            </Button>
        </div>
    );
}
