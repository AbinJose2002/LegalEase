import React, { useCallback, useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import verified from '../assets/verified.gif'

export default function AdvocateSuccess() {
    useEffect(() => {
        setTimeout(() => {
            window.location.replace('/advocate-login')
        }, 8000)
    }, [])
    return (
        <div>
            <Navbar />
            <div className="container pt-5 mt-5 d-flex flex-column justify-content-center align-items-center">
                <img src={verified} alt="" width={200}/>
                <h2 className='text-center'>Thank you for registering as an advocate. Your registration is being processed, and your account will be available within one hour. If you have any questions, please contact us at connect.admin@legalease.com</h2>
            </div>
        </div>
    )
}
