// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faFileAlt, faMoneyBill, faFolder, faComments, faUser, faVideo, faStar } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ setSelected }) => {
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
            <ul className="sidebar-menu">
                {[
                    { name: 'case', icon: faFileAlt, label: 'Case Details' },
                    { name: 'payment', icon: faMoneyBill, label: 'Payment' },
                    { name: 'document', icon: faFolder, label: 'Document' },
                    { name: 'profile', icon: faUser, label: 'Profile' },
                    { name: 'consult', icon: faVideo, label: 'Consultation' },
                    { name: 'review', icon: faStar, label: 'Review Advocate' }
                ].map(item => (
                    <li key={item.name} onClick={() => setSelected(item.name)}>
                        <FontAwesomeIcon icon={item.icon} style={{ marginRight: '10px', display: isCollapsed ? 'none' : 'block' }} />
                        <Link style={{ display: isCollapsed ? 'none' : 'block' }}>{item.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;