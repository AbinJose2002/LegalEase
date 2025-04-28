import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import './ChatbotIframe.css';

const ChatbotIframe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionChecked, setConnectionChecked] = useState(false);

  useEffect(() => {
    // Check if the Streamlit server is running
    const checkStreamlitConnection = async () => {
      try {
        const response = await fetch('http://localhost:8501/', { 
          mode: 'no-cors', // This is necessary due to CORS but will always resolve
          method: 'HEAD',
          timeout: 5000
        });
        
        // This will always succeed due to 'no-cors', so we're just checking if we don't timeout
        setLoading(false);
      } catch (error) {
        console.error('Error connecting to Streamlit server:', error);
        setError('Cannot connect to the chatbot service. Make sure the Streamlit server is running.');
      } finally {
        setConnectionChecked(true);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!connectionChecked) {
        setError('Connection timeout. Please make sure the Streamlit server is running at http://localhost:8501');
        setLoading(false);
      }
    }, 10000);

    checkStreamlitConnection();

    return () => clearTimeout(timeoutId);
  }, [connectionChecked]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleTryAlternative = () => {
    navigate('/ai-chatbot-local');
  };

  return (
    <div className="chatbot-iframe-container">
      <div className="chatbot-iframe-header">
        <button className="back-button" onClick={handleBackToHome}>
          <FaArrowLeft /> Back to Home
        </button>
        <h2>AI Legal Assistant</h2>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleTryAlternative}>Use Alternative Chatbot</button>
            <button onClick={() => window.location.reload()}>Retry Connection</button>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to legal chatbot service...</p>
        </div>
      )}

      <iframe 
        src="http://localhost:8501/"
        title="AI Legal Chatbot"
        className={`chatbot-iframe ${loading || error ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
      />

      <div className="chatbot-iframe-footer">
        <p>
          This AI assistant provides general information about Indian laws. 
          For specific legal advice, please consult a qualified lawyer.
        </p>
      </div>
    </div>
  );
};

export default ChatbotIframe;
