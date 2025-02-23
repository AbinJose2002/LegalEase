import express from 'express'
import { acceptAdvance, paymentUpdate } from '../controller/PaymentController.js'

const paymentRoute = express.Router()

paymentRoute.post('/advance', acceptAdvance)
paymentRoute.post('/update', paymentUpdate)

export default paymentRoute