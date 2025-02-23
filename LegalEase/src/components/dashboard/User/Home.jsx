// src/components/Dashboard.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../Navbar/Navbar'
import Case from './Case';
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';

const Home = () => {
    const [selected, setSelected] = useState('case'); // Default selected link

    return (
        <>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <Sidebar setSelected={setSelected} />
                <div style={{ padding: '20px', flex: 1 }}>
                    {/* <h2>Selected: {selected}</h2> Display the selected link */}
                    {(() => {
    switch (selected) {
        case 'case':
            return <Case />;  // Added return
        case 'profile':
            return <Profile />;
        case 'payment':
            return <Payment />;
        case 'document':
            return <Document />;
        default:
            return <Case />;
    }
})()}
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Home;