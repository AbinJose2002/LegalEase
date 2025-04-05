import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Home from '../components/Home/Home'
import Why from '../components/Why/Why'
import Advocate from '../components/Advocate/Advocate'
import Blog from '../components/Blog/Blog'

export default function Body() {
    return (
        <div>
            <Navbar />
            <div className="container">
                <Home />
                {/* <Why /> */}
                <Advocate />
                <Blog />
            </div>
        </div>
    )
}
