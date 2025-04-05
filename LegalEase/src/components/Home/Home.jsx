import './Home.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaEnvelope, FaBalanceScale, FaCalendarCheck, FaShieldAlt, FaRobot, FaComments } from 'react-icons/fa'

export default function Home() {
    const [isVisible, setIsVisible] = useState(false);
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Set visible immediately
        setIsVisible(true);
        
        // Add a class to body to indicate page is loaded
        document.body.classList.add('page-loaded');
        
        // Set fully loaded after a short delay
        const timer = setTimeout(() => {
            setIsFullyLoaded(true);
        }, 1200);
        
        return () => {
            clearTimeout(timer);
            document.body.classList.remove('page-loaded');
        };
    }, []);

    const handleChatbotRedirect = () => {
        navigate('/ai-chatbot');
    };

    return (
        <div className={`home-section col-12 px-lg-5 px-3 ${isFullyLoaded ? 'all-content-visible' : ''}`} id="home">
            <div className="pattern-overlay"></div>
            <div className="home-content-wrapper">
                <div className={`fade-in ${isVisible ? 'visible' : ''}`}>
                    <p className="home-tagline text-center">Modern Legal Solutions</p>
                    <h1 className="home-head text-center">
                        <span className="highlight">Streamline</span> Your Legal Practice
                    </h1>
                    <p className="home-para text-center">
                        LegalEase helps lawyers and clients manage cases, schedule appointments, and collaborate efficiently in one secure platform.
                    </p>
                </div>
                
                <div className={`button-container d-flex justify-content-center ${isVisible ? 'slide-up' : ''}`}>
                    <button className="btn btn-primary get-started-btn mx-3">
                        Get Started <FaArrowRight className="btn-icon" />
                    </button>
                    <button className="btn contact-btn mx-3">
                        <FaEnvelope className="btn-icon" /> Contact Us
                    </button>
                </div>
                
                <div className={`feature-section ${isVisible ? 'fade-in visible' : ''}`}>
                    <h2 className="feature-heading text-center">Key Platform Features</h2>
                    <div className={`feature-cards ${isVisible ? 'fade-in' : ''}`}>
                        <div className="row mt-5">
                            <div className="col-md-3 mb-4">
                                <div className="feature-card card-purple">
                                    <div className="card-icon">
                                        <FaBalanceScale />
                                    </div>
                                    <h3>Case Management</h3>
                                    <p>Organize and track all your cases in one place</p>
                                </div>
                            </div>
                            <div className="col-md-3 mb-4">
                                <div className="feature-card card-blue">
                                    <div className="card-icon">
                                        <FaCalendarCheck />
                                    </div>
                                    <h3>Smart Scheduling</h3>
                                    <p>Never miss an important appointment or deadline</p>
                                </div>
                            </div>
                            <div className="col-md-3 mb-4">
                                <div className="feature-card card-teal">
                                    <div className="card-icon">
                                        <FaShieldAlt />
                                    </div>
                                    <h3>Secure Platform</h3>
                                    <p>Your data is protected with enterprise-grade security</p>
                                </div>
                            </div>
                            <div className="col-md-3 mb-4">
                                <div className="feature-card card-orange">
                                    <div className="card-icon">
                                        <FaRobot />
                                    </div>
                                    <h3>AI Legal Assistant</h3>
                                    <p>Get instant answers to common legal questions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`chatbot-section ${isVisible ? 'fade-in visible' : ''}`}>
                    <div className="row align-items-center mt-5 pt-5">
                        <div className="col-md-6">
                            <h2>AI Legal Assistant</h2>
                            <p className="chatbot-description">
                                Our AI-powered legal chatbot provides instant answers to common legal questions,
                                helps with document analysis, and gives preliminary guidance on legal matters.
                                Available 24/7, it's the perfect first step before consulting with a human attorney.
                            </p>
                            <button className="btn btn-primary chatbot-btn" onClick={handleChatbotRedirect}>
                                Try AI Assistant <FaComments className="btn-icon" />
                            </button>
                        </div>
                        <div className="col-md-6 text-center">
                            <div className="chatbot-image-container">
                                <img 
                                    src="/chatbot-illustration.svg" 
                                    alt="AI Legal Assistant" 
                                    className="chatbot-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x300?text=AI+Legal+Assistant";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
