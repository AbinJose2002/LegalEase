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
                            <Button
                                as={Link}
                                to="/login"
                                variant="primary"
                                className="ms-lg-3 mt-2 mt-lg-0"
                                onClick={() => setExpanded(false)}
                            >
                                Login
                            </Button>
                        }


                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
