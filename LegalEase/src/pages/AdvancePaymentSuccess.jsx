import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from "../components/Navbar/Navbar"
import verified from '../assets/verified.gif'

export default function AdvancePaymentSuccess() {
  const navigate = useNavigate()
  const case_id = useParams()
    useEffect(() => {
      const advanceFeeUpdate = async () => {
        try {
          console.log(case_id)
          const res = await axios.post("http://localhost:8080/api/payment/update",{case_id})
          if(res.status){
            setTimeout(()=>{
              navigate('/userdash')
            }, 4000)
          }
        } catch (error) {
          console.log(error)
        }
      }
      advanceFeeUpdate()
    }, [])
    
  return (
    <div>
      <Navbar />
      <div className="container pt-5 mt-5 d-flex flex-column justify-content-center align-items-center">
                      <img src={verified} alt="" width={200}/>
                      <h2 className='text-center'>Your advance payment has been successfully processed. The advocate will reach out to you shortly.</h2>
                  </div>
    </div>
  )
}
