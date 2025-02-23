// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faFileAlt, faMoneyBill, faFolder, faBlog, faUser  } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS file

const AdvocateSidebar = ({ setSelected }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button onClick={toggleSidebar} className="toggle-button">
                <FontAwesomeIcon icon={isCollapsed ? faArrowRight : faArrowLeft} />
            </button>
            <h3 style={{ display: isCollapsed ? 'none' : 'block' }}>Dashboard</h3>
            <ul>
                <li onClick={() => setSelected('client')}>
                    <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link  style={{ display: isCollapsed ? 'none' : 'block' }}>Client Details</Link>
                </li>
                <li onClick={() => setSelected('case')}>
                    <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link  style={{ display: isCollapsed ? 'none' : 'block' }}>Case Details</Link>
                </li>
                <li onClick={() => setSelected('payment')}>
                    <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link style={{ display: isCollapsed ? 'none' : 'block' }}>Payment</Link>
                </li>
                <li onClick={() => setSelected('document')}>
                    <FontAwesomeIcon icon={faFolder} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link style={{ display: isCollapsed ? 'none' : 'block' }}>Document</Link>
                </li>
                <li onClick={() => setSelected('blog')}>
                    <FontAwesomeIcon icon={faBlog} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link style={{ display: isCollapsed ? 'none' : 'block' }}>Blog</Link>
                </li>
                <li onClick={() => setSelected('profile')}>
                    <FontAwesomeIcon icon={faUser } style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                    <Link style={{ display: isCollapsed ? 'none' : 'block' }}>Profile</Link>
                </li>
            </ul>
        </div>
    );
};

export default AdvocateSidebar;