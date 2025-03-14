import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Spinner, Alert, Table } from 'react-bootstrap';

export default function Consultation() {
    const [advocates, setAdvocates] = useState([]);
    const [advocateId, setAdvocateId] = useState("");
    const [date, setDate] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [timeSlots, setTimeSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [consultationId, setConsultationId] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [error, setError] = useState("");
    const [confirmedConsultations, setConfirmedConsultations] = useState([]);

    useEffect(() => {
        fetchAdvocates();
        fetchConfirmedConsultations();
    }, []);

    // ✅ Fetch Available Advocates
    const fetchAdvocates = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/advocate/fetch");
            setAdvocates(response.data.advocates);
        } catch (error) {
            console.error("Error fetching advocates:", error);
            setError("Failed to load advocates.");
        }
    };

    // ✅ Fetch Confirmed Consultations
    const fetchConfirmedConsultations = async () => {
        try {
            const token = localStorage.getItem("usertoken");
            const response = await axios.post("http://localhost:8080/api/consultations/confirmed", { token });
            // console.log(response.data.consult)
            setConfirmedConsultations(response.data.consult);
        } catch (error) {
            console.error("Error fetching consultations:", error);
            setError("Failed to load confirmed consultations.");
        }
    };

    // ✅ Generate Available Time Slots (Excluding Lunch Break)
    const generateTimeSlots = async (selectedDate) => {
        const slots = [];
        let startHour = 10, startMinute = 0;

        while (startHour < 17) {
            let endHour = startHour;
            let endMinute = startMinute + 30;
            if (endMinute === 60) {
                endHour += 1;
                endMinute = 0;
            }

            const slot = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} to ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

            if (startHour !== 13) { // Exclude lunch break (1:00 - 2:00 PM)
                slots.push(slot);
            }

            startHour = endHour;
            startMinute = endMinute;
        }

        setTimeSlots(slots);
        fetchBookedSlots(selectedDate);
    };

    // ✅ Fetch Already Booked Slots for Selected Date
    const fetchBookedSlots = async (selectedDate) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/consultations/booked?date=${selectedDate}&advocateId=${advocateId}`);
            setBookedSlots(response.data.bookedSlots);
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setError("Failed to load booked slots.");
        }
    };

    // ✅ Handle Advocate Selection
    const handleAdvocateChange = (e) => {
        setAdvocateId(e.target.value);
        setDate("");
        setSelectedTimeSlot("");
        setConsultationId("");
    };

    // ✅ Handle Date Selection
    const handleDateChange = (e) => {
        setDate(e.target.value);
        generateTimeSlots(e.target.value);
        setSelectedTimeSlot("");
        setConsultationId("");
    };

    // ✅ Handle Time Slot Selection
    const handleSlotSelection = (slot) => {
        if (!bookedSlots.includes(slot)) {
            setSelectedTimeSlot(slot);
            setConsultationId("");
        }
    };

    // ✅ Handle Consultation Request
    const requestConsultation = async () => {
        if (!advocateId || !date || !selectedTimeSlot) {
            setError("Please select an advocate, date, and time slot.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("usertoken");
            const response = await axios.post(
                "http://localhost:8080/api/consultations/request",
                { advocateId, date, timeSlot: selectedTimeSlot },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setConsultationId(response.data.consultation._id);
            alert("Consultation booked successfully! Proceed to payment.");
            initiatePayment(response.data.consultation._id);
        } catch (error) {
            console.error("Error requesting consultation:", error);
            setError("Error booking consultation.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Payment for Consultation
    const initiatePayment = async (consultationId) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.post("http://localhost:8080/api/consultations/initiate-payment", { consultationId });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                setError("Payment failed. Try again.");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            setError("Payment failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Function to Check If the Current Time Matches a Time Slot
    const isCurrentTimeMatchingSlot = (timeSlot) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const [start, end] = timeSlot.split(" to ");

        return currentTime >= start && currentTime <= end;
    };

    return (
        <div className="container mt-5">
            <h2>Video Consultation</h2>

            <Form className="mb-4">
                {/* ✅ Advocate Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Select an Advocate</Form.Label>
                    <Form.Select value={advocateId} onChange={handleAdvocateChange} required>
                        <option value="">Choose an advocate</option>
                        {advocates.map((advocate) => (
                            <option key={advocate._id} value={advocate._id}>
                                Adv. {advocate.firstName} {advocate.lastName}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* ✅ Date Picker */}
                {advocateId && (
                    <Form.Group className="mb-3">
                        <Form.Label>Select Date</Form.Label>
                        <Form.Control type="date" value={date} onChange={handleDateChange} required />
                    </Form.Group>
                )}

                {/* ✅ Time Slot Selection */}
                {date && (
                    <div className="mb-3">
                        <h5>Select a Time Slot</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {timeSlots.map((slot, index) => (
                                <Button
                                    key={index}
                                    variant={bookedSlots.includes(slot) ? "danger" : (selectedTimeSlot === slot ? "primary" : "outline-success")}
                                    disabled={bookedSlots.includes(slot)}
                                    onClick={() => handleSlotSelection(slot)}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {/* ✅ Submit Button */}
                <Button type="button" variant="primary" disabled={!advocateId || !date || !selectedTimeSlot || loading} onClick={requestConsultation}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Request Consultation"}
                </Button>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* ✅ Table for Confirmed Consultations */}
            <h3 className="mt-4">My Confirmed Consultations</h3>
            {confirmedConsultations.length > 0 ? (
                <Table striped bordered hover className="mt-3">
                    <thead className="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Time Slot</th>
                            {/* <th>Advocate</th> */}
                            <th>Meeting Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {confirmedConsultations.map((consultation) => (
                            <tr key={consultation._id}>
                                <td>{consultation.date}</td>
                                <td>{consultation.timeSlot}</td>
                                {/* <td>Adv. {consultation.advocate.firstName} {consultation.advocate.lastName}</td> */}

                                <td>
                                    {isCurrentTimeMatchingSlot(consultation.timeSlot) ? (
                                        <a href={consultation.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                                            Join Meeting
                                        </a>
                                    ) : (
                                        <Button variant="secondary" disabled>
                                            Not Available Yet
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No confirmed consultations.</p>
            )}
        </div>
    );
}
