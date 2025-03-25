import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faArrowRight, faFileAlt, faMoneyBill, faFolder, faBlog, faUser, faVideo } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS file

function AdvocateSidebar({ selected, setSelected }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button onClick={toggleSidebar} className="toggle-button hover-effect">
                <FontAwesomeIcon icon={isCollapsed ? faArrowRight : faArrowLeft} />
            </button>
            <div className="sidebar-header">
                <FontAwesomeIcon icon={faHome} className="dashboard-icon" />
                <h3 style={{ display: isCollapsed ? 'none' : 'block' }}>Dashboard</h3>
            </div>
            <ul className="sidebar-menu">
                {[
                    { name: 'client', icon: faFileAlt, label: 'Client Details' },
                    { name: 'case', icon: faFileAlt, label: 'Case Details' },
                    { name: 'payment', icon: faMoneyBill, label: 'Payment' },
                    { name: 'document', icon: faFolder, label: 'Document' },
                    { name: 'blog', icon: faBlog, label: 'Blog' },
                    { name: 'profile', icon: faUser, label: 'Profile' },
                    { name: 'meetings', icon: faVideo, label: 'Meetings' }
                ].map(item => (
                    <li 
                        key={item.name}
                        onClick={() => setSelected(item.name)}
                        className={`menu-item ${selected === item.name ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={item.icon} className="menu-icon" />
                        <span className={isCollapsed ? 'hidden' : ''}>
                            {item.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdvocateSidebar;