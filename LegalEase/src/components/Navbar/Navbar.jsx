import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png'

const NavigationBar = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar
            expand="lg"
            bg="white"
            fixed="top"
            className="shadow-sm"
            expanded={expanded}
            style={{ zIndex: 1030 }}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img
                        src={logo}
                        alt="LegalEase Logo"
                        height="40"
                        className="d-inline-block align-top me-2"
                    />
                    <span className="brand-text">LegalEase</span>
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            onClick={() => setExpanded(false)}
                            className="nav-link"
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link
                            href='#why'
                            onClick={() => setExpanded(false)}
                            className="nav-link"
                        >
                            About Us
                        </Nav.Link>
                        <Nav.Link
                            href='#advocate'
                            onClick={() => setExpanded(false)}
                            className="nav-link"
                        >
                            Advocates
                        </Nav.Link>
                        <Nav.Link
                            href="#blog"
                            onClick={() => setExpanded(false)}
                            className="nav-link"
                        >
                            Blogs
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/contact"
                            onClick={() => setExpanded(false)}
                            className="nav-link"
                        >
                            Contact us
                        </Nav.Link>

                        {localStorage.usertoken &&
                            <Button
                            as={Link}
                            to="/userdash"
                            variant="primary"
                            className="ms-lg-3 mt-2 mt-lg-0"
                            onClick={() => setExpanded(false)}
                        >
                            Dashboard
                        </Button>
                        }
                        {localStorage.advocatetoken &&
                            <Button
                            as={Link}
                            to="/advocatedash"
                            variant="primary"
                            className="ms-lg-3 mt-2 mt-lg-0"
                            onClick={() => setExpanded(false)}
                        >
                            Dashboard
                        </Button>
                        }
                        {localStorage.admintoken &&
                            <Button
                            as={Link}
                            to="/admindsah"
                            variant="primary"
                            className="ms-lg-3 mt-2 mt-lg-0"
                            onClick={() => setExpanded(false)}
                        >
                            Dashboard
                        </Button>
                        }


                        {localStorage.usertoken || localStorage.advocatetoken || localStorage.admintoken ?
                            <Button
                                as={Link}
                                to="/login"
                                variant="primary"
                                className="ms-lg-3 mt-2 mt-lg-0"
                                onClick={() => {
                                    localStorage.removeItem('usertoken')
                                    localStorage.removeItem('admintoken')
                                    localStorage.removeItem('advocatetoken')
                                }
                                }
                            >
                                Logout
                            </Button>
                            :
                            <div className="dropdown">
                                <button 
                                    className="btn btn-primary dropdown-toggle ms-lg-3 mt-2 mt-lg-0" 
                                    type="button" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    Login As
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/login"
                                            onClick={() => setExpanded(false)}
                                        >
                                            Client Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/advocate-login"
                                            onClick={() => setExpanded(false)}
                                        >
                                            Advocate Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/admin-login"
                                            onClick={() => setExpanded(false)}
                                        >
                                            Admin Login
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        }


                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
