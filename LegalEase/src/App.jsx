import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Body from './pages/Body'
import Login from '../src/components/Auth/Login'
import Home from './components/dashboard/User/Home'
import AdvocateHome from './components/dashboard/Advocate/AdvocateHome'
import Register from '../src/components/Auth/Register'
import AdvocateLogin from './components/Auth/AdvocateLogin'
import AdvocateRegister from './components/Auth/AdvocateRegister'
import AdvocateSuccess from './pages/AdvocateSuccess'
import AdvancePaymentSuccess from './pages/AdvancePaymentSuccess'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import Navbar from './components/Navbar/Navbar'
import AdminLogin from './components/Auth/AdminLogin'
import AdminDashboard from './components/dashboard/Admin/AdminDashboard'
import AILegalChatbot from './components/Chatbot/AILegalChatbot'
import './styles/animations-fix.css'; // Add this import
import './styles/global-width-fix.css'; // Add this import

export default function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Body />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/userdash' element={<Home />}></Route>
          <Route path='/advocatedash' element={<AdvocateHome />}></Route>
          <Route path='/advocate-login' element={<AdvocateLogin />}></Route>
          <Route path='/advocate-register' element={<AdvocateRegister />}></Route>
          <Route path='/advocate-register-success' element={<AdvocateSuccess />}></Route>
          <Route path='/advance-payment-success/:pay_type/:pay_id/:case_id' element={<AdvancePaymentSuccess />}></Route>
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/ai-chatbot" element={<AILegalChatbot />} />
        </Routes>
      </Router>
    </div>
  )
}
