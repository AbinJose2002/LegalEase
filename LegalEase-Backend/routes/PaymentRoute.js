import express from 'express'
import { handleStripeWebhook } from "../controller/PaymentController.js";
import bodyParser from "body-parser";
import { acceptAdvance, acceptSitting, addPayment, fetchPaymentByCase, paymentUpdate } from '../controller/PaymentController.js'

const paymentRoute = express.Router()

paymentRoute.post('/advance', acceptAdvance)
paymentRoute.post('/update', paymentUpdate)
paymentRoute.post('/fetch-case', fetchPaymentByCase)
paymentRoute.post('/add', addPayment)
paymentRoute.post('/sitting', acceptSitting)
paymentRoute.post("/webhook", bodyParser.raw({ type: "application/json" }), handleStripeWebhook);


export default paymentRoute