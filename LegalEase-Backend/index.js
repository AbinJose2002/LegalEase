import express from 'express'
import {connection} from './config/db.js'
import cors from 'cors'
import userRouter from './routes/UserRoutes.js'
import advocateRouter from './routes/AdvocateRoute.js'
import caseRouter from './routes/CaseRoute.js'
import paymentRoute from './routes/PaymentRoute.js'
import blogRouter from './routes/BlogRoute.js'
import documentRouter from './routes/DocumentRoute.js'
import consultationRoute from './routes/ConsultationRoutes.js'
import adminRouter from './routes/AdminRoute.js'
import reviewRouter from './routes/ReviewRoute.js'

const PORT = 8080
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

connection();

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

//setting routes
app.use('/api/user/',userRouter)
app.use('/api/advocate/',advocateRouter)
app.use('/api/case/',caseRouter)
app.use('/api/payment/',paymentRoute)
app.use('/api/blogs/',blogRouter)
app.use('/api/documents/',documentRouter)
app.use('/api/consultations/',consultationRoute)
app.use('/api/admin/', adminRouter)
app.use('/api/review', reviewRouter)

//checking the get 8080
app.get("/",(req,res)=>{
    res.send("hi")
})

app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
})