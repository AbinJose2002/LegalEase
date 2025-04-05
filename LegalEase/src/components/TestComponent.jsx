import { useState, useEffect } from 'react';
import './TestComponent.css';

const TestComponent = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        setIsVisible(true);
    }, []);
    
    return (
        <div className="test-component-wrapper">
            <div className="pattern-overlay"></div>
            <div className={`test-content fade-in ${isVisible ? 'visible' : ''}`}>
                <p className="component-tagline">Component Example</p>
                <h2 className="test-title">
                    <span className="highlight">Test</span> Component
                </h2>
                <p className="test-description">
                    This is a test component to demonstrate our design system and styling patterns.
                </p>
                
                <h3 className="section-heading">Interactive Elements</h3>
                <div className="button-group">
                    <button className="btn primary-btn">
                        Test Button
                    </button>
                    <button className="btn secondary-btn">
                        Another Button
                    </button>
                </div>
                
                <h3 className="section-heading">Card Example</h3>
                <div className="test-card">
                    <div className="card-content">
                        <div className="card-icon">🧪</div>
                        <h4>Test Card</h4>
                        <p>This is a sample card showing our design pattern</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestComponent;
