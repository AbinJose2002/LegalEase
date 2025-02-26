import express from 'express'
import { acceptAdvance, acceptSitting, addPayment, fetchPaymentByCase, paymentUpdate } from '../controller/PaymentController.js'

const paymentRoute = express.Router()

paymentRoute.post('/advance', acceptAdvance)
paymentRoute.post('/update', paymentUpdate)
paymentRoute.post('/fetch-case', fetchPaymentByCase)
paymentRoute.post('/add', addPayment)
paymentRoute.post('/sitting', acceptSitting)

export default paymentRoute