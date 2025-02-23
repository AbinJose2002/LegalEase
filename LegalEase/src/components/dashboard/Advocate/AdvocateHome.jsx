// src/components/Dashboard.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdvocateSidebar from './AdvocateSidebar';
import Navbar from '../../Navbar/Navbar'
import Client from './Client';
import Profile from './Profile';
import Payment from './Payment';
import Document from './Document';
import Case from './Case';
import Blog from './Blog';

const AdvocateHome = () => {
    const [selected, setSelected] = useState('client'); // Default selected link

    return (
        <>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <AdvocateSidebar setSelected={setSelected} />
                <div style={{ padding: '20px', flex: 1 }}>
                    {/* <h2>Selected: {selected}</h2> Display the selected link */}
                    {(() => {
                        switch (selected) {
                            case 'client':
                                return <Client />;  // Added return
                            case 'profile':
                                return <Profile />;
                            case 'payment':
                                return <Payment />;
                            case 'case':
                                return <Case />;
                            case 'document':
                                return <Document />;
                            case 'blog':
                                return <Blog />;
                            default:
                                return <Client />;
                        }
                    })()}
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default AdvocateHome;