import express from "express";
import { getBookedSlots, requestConsultation, acceptConsultation, initiateConsultationPayment, scheduleMeeting, fetchConsultation } from "../controller/ConsultationController.js"

const consultationRoute = express.Router();

// ✅ Fetch already booked time slots
consultationRoute.get("/booked", getBookedSlots);

// ✅ Client requests a consultation
consultationRoute.post("/request", requestConsultation);

// ✅ Advocate accepts a consultation request
consultationRoute.post("/accept", acceptConsultation);

// ✅ Client initiates payment
consultationRoute.post("/initiate-payment", initiateConsultationPayment);

// ✅ After payment, schedule the meeting
consultationRoute.post("/schedule", scheduleMeeting);

consultationRoute.post("/confirmed", fetchConsultation);

export default consultationRoute;
