import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Alert } from "react-bootstrap";

export default function PaymentFailed() {
    const navigate = useNavigate();

    return (
        <div className="container text-center mt-5">
            <h2>❌ Payment Failed</h2>

            <Alert variant="danger">
                <p>Your payment was not successful. Please try again.</p>
            </Alert>

            <Button variant="primary" onClick={() => navigate("/consultation")}>
                Retry Payment
            </Button>

            <Button variant="secondary" className="ms-3" onClick={() => navigate("/")}>
                Go to Home
            </Button>
        </div>
    );
}
