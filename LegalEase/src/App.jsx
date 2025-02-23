import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Body from './pages/Body'
import Login from '../src/components/Auth/Login'
import Home from './components/dashboard/User/Home'
import AdvocateHome from './components/dashboard/Advocate/AdvocateHome'
import Register from '../src/components/Auth/Register'
import AdvocateLogin from './components/Auth/AdvocateLogin'
import AdvocateRegister from './components/Auth/AdvocateRegister'
import AdvocateSuccess from './pages/AdvocateSuccess'
import AdvancePaymentSuccess from './pages/AdvancePaymentSuccess'

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Body />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/userdash' element={<Home />}></Route>
          <Route path='/advocatedash' element={<AdvocateHome />}></Route>
          <Route path='/advocate-login' element={<AdvocateLogin />}></Route>
          <Route path='/advocate-register' element={<AdvocateRegister />}></Route>
          <Route path='/advocate-register-success' element={<AdvocateSuccess />}></Route>
          <Route path='/advance-payment-success/:case_id' element={<AdvancePaymentSuccess />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
