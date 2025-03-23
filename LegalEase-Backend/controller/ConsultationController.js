import ConsultationModel from "../model/ConsultationModel.js";
import PaymentModel from "../model/PaymentModel.js";
import AdvocateModel from "../model/AdvocateModel.js";
import { userModal } from "../model/UserModel.js";
import CaseModel from "../model/CaseModel.js";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// Extract User ID from Token
const getUserId = (req) => {
    // console.log(req.headers)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// ✅ 1. Fetch Already Booked Slots for an Advocate on a Specific Date
export const getBookedSlots = async (req, res) => {
    const { date, advocateId } = req.query;

    try {
        const bookedConsultations = await ConsultationModel.find({ advocateId, date });
        const bookedSlots = bookedConsultations.map((consultation) => consultation.timeSlot);

        res.status(200).json({ bookedSlots });
    } catch (error) {
        res.status(500).json({ message: "Error fetching booked slots", error });
    }
};

// ✅ 2. Request a Video Consultation
export const requestConsultation = async (req, res) => {
    const clientId = getUserId(req);
    if (!clientId) return res.status(401).json({ message: "Unauthorized" });

    const { advocateId, date, timeSlot } = req.body;

    try {
        // Check if slot is already booked
        const existingConsultation = await ConsultationModel.findOne({ advocateId, date, timeSlot });
        if (existingConsultation) {
            return res.status(400).json({ message: "Time slot already booked" });
        }

        const newConsultation = new ConsultationModel({
            clientId,
            advocateId,
            date,
            timeSlot
        });

        await newConsultation.save();
        res.status(201).json({ message: "Consultation request sent", consultation: newConsultation });
    } catch (error) {
        res.status(500).json({ message: "Error requesting consultation", error });
    }
};

// ✅ 3. Advocate Accepts Consultation Request
export const acceptConsultation = async (req, res) => {
    const { consultationId } = req.body;

    try {
        await ConsultationModel.findByIdAndUpdate(consultationId, { status: "Accepted" });
        res.status(200).json({ message: "Consultation accepted" });
    } catch (error) {
        res.status(500).json({ message: "Error accepting consultation", error });
    }
};



export const initiateConsultationPayment = async (req, res) => {
    const { consultationId } = req.body;
    try {
        const consultation = await ConsultationModel.findById(consultationId).populate("advocateId");
        // console.log(consultation)
        if (!consultation) return res.status(404).json({ message: "Consultation not found" });

        const consultationFee = consultation.advocateId.consultationFee * 100; // Convert to cents (Stripe requires smallest currency unit)

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: `Consultation with Adv. ${consultation.advocateId.firstName}` },
                        unit_amount: consultationFee
                    },
                    quantity: 1
                }
            ],
            success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&consultationId=${consultationId}`,
            cancel_url: `http://localhost:5173/payment-failed`
        });

        // Create a payment entry with status "Pending"
        const newPayment = new PaymentModel({
            case_id: consultationId,
            type: "Consultation",
            status: "Pending",
            amount: consultation.advocateId.consultationFee,
            payment_date: new Date()
        });

        await newPayment.save();

        res.status(200).json({ message: "Payment initiated", url: session.url });
    } catch (error) {
        console.error("❌ Stripe Payment Error:", error);
        res.status(500).json({ message: "Error initiating payment", error });
    }
};


// ✅ 5. Schedule the Meeting After Payment
export const scheduleMeeting = async (req, res) => {
    const { consultationId } = req.body;
    const meetingLink = `https://meet.jit.si/${consultationId}`; // Using Jitsi Meet for free video calls

    try {
        await ConsultationModel.findByIdAndUpdate(consultationId, { status: "Scheduled", meetingLink });
        res.status(200).json({ message: "Meeting scheduled", meetingLink });
    } catch (error) {
        res.status(500).json({ message: "Error scheduling meeting", error });
    }
};

export const fetchConsultation = async (req, res) => {

    const clientToken = req.body.token;
    const decodedToken = jwt.verify(clientToken, process.env.JWT_SECRET)
    const clientId = decodedToken.id

    try {
        const consult = await ConsultationModel.find({
            status: "Scheduled",
            clientId: clientId, // Assuming clientId is a variable
        });
        res.json({success: "true", consult})
    } catch (error) {
        res.json({ success: "false" })
    }
};

export const getAdvocateMeetings = async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch meetings for this advocate
        let meetings = await ConsultationModel.find({
            advocateId: decodedToken.id,
            status: "Scheduled"
        }).lean(); // Use lean() for better performance since we're modifying the objects

        // Fetch additional details for each meeting
        const enrichedMeetings = await Promise.all(meetings.map(async (meeting) => {
            // Get client details
            const client = await userModal.findById(meeting.clientId).lean();
            
            // Get case details if there's a case associated
            let caseDetails = null;
            if (meeting.caseId) {
                caseDetails = await CaseModel.findById(meeting.caseId).lean();
            }

            return {
                ...meeting,
                clientDetails: client || {},
                caseDetails: caseDetails || {}
            };
        }));

        res.json({ success: "true", meetings: enrichedMeetings });
    } catch (error) {
        console.error("Error in getAdvocateMeetings:", error);
        res.status(500).json({ 
            success: "false", 
            message: "Error fetching meetings",
            error: error.message 
        });
    }
};