import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaArrowLeft, FaExclamationTriangle, FaBug, FaStethoscope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import { getGeminiResponse, checkGeminiApiAvailability } from '../../utils/geminiApi';
import { generateDiagnosticReport } from '../../utils/apiDebug';
import './AILegalChatbot.css';

const AILegalChatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI legal assistant specialized in Indian law. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [useGeminiApi, setUseGeminiApi] = useState(true);
    const [apiStatus, setApiStatus] = useState({ 
        ok: true, 
        message: '', 
        errorCount: 0,
        lastChecked: null,
        isChecking: false
    });
    const [debugMode, setDebugMode] = useState(false);
    const [diagnosticMode, setDiagnosticMode] = useState(false);
    const [diagnosticReport, setDiagnosticReport] = useState('');
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const endOfMessagesRef = useRef(null);
    const navigate = useNavigate();
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const intents = [
        {
            intent: 'rights',
            phrases: [
                'what are my fundamental rights', 
                'tell me about my rights',
                'constitutional rights in india',
                'what rights do citizens have',
                'explain fundamental rights'
            ],
            response: 'In India, fundamental rights are guaranteed under Part III of the Constitution, including right to equality, freedom, against exploitation, freedom of religion, cultural and educational rights, and right to constitutional remedies.'
        },
        {
            intent: 'fir',
            phrases: [
                'how to file an fir', 
                'what is an fir',
                'first information report procedure',
                'how to register police complaint',
                'fir filing process'
            ],
            response: 'An FIR (First Information Report) is a document prepared by police when they receive information about a cognizable offense. Anyone can file an FIR at the police station under whose jurisdiction the incident occurred.'
        },
        {
            intent: 'divorce',
            phrases: [
                'divorce laws in india', 
                'how to get divorced',
                'grounds for divorce',
                'divorce procedure',
                'hindu marriage act divorce'
            ],
            response: 'In India, divorce laws vary by religion. Under the Hindu Marriage Act, divorce can be sought on grounds like adultery, cruelty, desertion, conversion, mental disorder, etc. The Muslim Personal Law allows divorce through different methods like Talaq, Khula, and Mubarat.'
        },
        {
            intent: 'bail',
            phrases: [
                'what is bail', 
                'how to get bail',
                'bail provisions',
                'anticipatory bail',
                'bail procedure in india'
            ],
            response: 'Bail is the temporary release of an accused person awaiting trial. In India, bail provisions are covered under Sections 436-450 of the Criminal Procedure Code. Offenses are classified as bailable and non-bailable.'
        },
        {
            intent: 'rti',
            phrases: [
                'right to information', 
                'how to file rti',
                'rti act',
                'information request government',
                'transparency law'
            ],
            response: 'The Right to Information Act 2005 mandates timely response to citizen requests for government information. It applies to all constitutional authorities and aims to promote transparency and accountability in governance.'
        },
        {
            intent: 'consumer',
            phrases: [
                'consumer protection', 
                'consumer rights',
                'how to file consumer complaint',
                'consumer court procedure',
                'defective product legal action'
            ],
            response: 'The Consumer Protection Act 2019 protects consumer interests, establishes Consumer Dispute Redressal Commissions at district, state and national levels, and provides for penalties for misleading advertisements and product liability.'
        },
        {
            intent: 'property',
            phrases: [
                'property laws', 
                'real estate legal issues',
                'property inheritance',
                'land ownership laws',
                'property registration'
            ],
            response: 'Property laws in India include the Transfer of Property Act, Registration Act, and various state-specific laws. They cover ownership rights, transfer procedures, inheritance, and dispute resolution mechanisms.'
        },
        {
            intent: 'section_375',
            phrases: [
                'what is section 375', 
                'section 375 ipc',
                'rape laws in india',
                'sexual offense section 375',
                'criminal law section 375'
            ],
            response: 'Section 375 of the Indian Penal Code defines the offense of rape and specifies circumstances that constitute rape.'
        },
        {
            intent: 'section_302',
            phrases: [
                'what is section 302', 
                'section 302 ipc',
                'murder punishment',
                'homicide law india',
                'killing penalty section 302'
            ],
            response: 'Section 302 of the Indian Penal Code deals with punishment for murder, which is death or imprisonment for life and also fine.'
        },
        {
            intent: 'section_498a',
            phrases: [
                'what is section 498a', 
                'section 498a ipc',
                'domestic violence law',
                'husband cruelty section',
                'dowry harassment law'
            ],
            response: 'Section 498A of the Indian Penal Code deals with husband or relative of husband of a woman subjecting her to cruelty.'
        },
        {
            intent: 'greeting',
            phrases: [
                'hello', 
                'hi',
                'greetings',
                'good morning',
                'namaste'
            ],
            response: 'Hello! I\'m your AI legal assistant. How can I help you with Indian legal matters today?'
        },
        {
            intent: 'thanks',
            phrases: [
                'thank you', 
                'thanks',
                'appreciate it',
                'thanks for the help',
                'thank you for your assistance'
            ],
            response: 'You\'re welcome! If you have any more questions about Indian law, feel free to ask.'
        },
        {
            intent: 'goodbye',
            phrases: [
                'bye', 
                'goodbye',
                'see you later',
                'talk to you later',
                'have a good day'
            ],
            response: 'Goodbye! Feel free to return if you have more legal questions.'
        },
        {
            intent: 'unknown',
            phrases: [
                'random text',
                'nonsense',
                'xyz123',
                'blah blah',
                'something weird'
            ],
            response: "I'm not sure about that specific legal matter. For complex legal issues, I recommend consulting with a qualified lawyer. Can I help you with something else related to Indian law?"
        }
    ];

    useEffect(() => {
        const prepareModel = async () => {
            setIsModelLoading(true);
            try {
                if (useGeminiApi && geminiApiKey) {
                    setIsModelLoading(false);
                    console.log("Using Gemini API for responses");
                    return;
                }

                const model = tf.sequential();
                
                model.add(tf.layers.dense({
                    units: 128,
                    activation: 'relu',
                    inputShape: [50]
                }));
                model.add(tf.layers.dropout(0.5));
                model.add(tf.layers.dense({
                    units: 64,
                    activation: 'relu'
                }));
                model.add(tf.layers.dropout(0.5));
                model.add(tf.layers.dense({
                    units: intents.length,
                    activation: 'softmax'
                }));
                
                model.compile({
                    optimizer: tf.train.adam(0.001),
                    loss: 'categoricalCrossentropy',
                    metrics: ['accuracy']
                });
                
                setModel(model);
                setIsModelLoading(false);
                
                console.log("ML model initialized successfully");
            } catch (error) {
                console.error("Error initializing ML model:", error);
                setIsModelLoading(false);
            }
        };
        
        prepareModel();
    }, [useGeminiApi, geminiApiKey]);

    useEffect(() => {
        const checkApiStatus = async () => {
            if (!useGeminiApi) {
                setApiStatus({ ok: true, message: '', errorCount: 0, isChecking: false });
                return;
            }

            if (!geminiApiKey) {
                console.warn("Gemini API key is missing! Add it to your .env file");
                setApiStatus({
                    ok: false,
                    message: "API key missing. Check console for instructions.",
                    errorCount: 0,
                    lastChecked: new Date(),
                    isChecking: false
                });
                return;
            }

            const shouldCheckAvailability = !apiStatus.lastChecked || 
                (new Date() - apiStatus.lastChecked > 60000) || 
                apiStatus.errorCount > 0;

            if (shouldCheckAvailability) {
                try {
                    setApiStatus(prev => ({ ...prev, isChecking: true }));
                    
                    if (debugMode) {
                        console.log("🔍 Debug: Checking API availability with key:", 
                            geminiApiKey ? geminiApiKey.substring(0, 5) + '...' : 'undefined');
                    }
                    
                    const result = await checkGeminiApiAvailability(geminiApiKey, debugMode);
                    
                    if (debugMode) {
                        console.log("🔍 Debug: API availability result:", result);
                    }
                    
                    if (result.available) {
                        setApiStatus({ 
                            ok: true, 
                            message: '', 
                            errorCount: 0,
                            lastChecked: new Date(),
                            isChecking: false
                        });
                    } else {
                        setApiStatus({
                            ok: false,
                            message: `Gemini API issue: ${result.message}. Using fallback model.`,
                            errorCount: apiStatus.errorCount + 1,
                            lastChecked: new Date(),
                            isChecking: false
                        });
                    }
                } catch (error) {
                    console.error("Error checking API status:", error);
                    setApiStatus({
                        ok: false,
                        message: `API error: ${error.message}. Using fallback model.`,
                        errorCount: apiStatus.errorCount + 1,
                        lastChecked: new Date(),
                        isChecking: false
                    });
                }
            }
        };

        checkApiStatus();
    }, [useGeminiApi, geminiApiKey, debugMode, apiStatus.errorCount, apiStatus.lastChecked]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const vectorizeText = (text) => {
        const dictionary = new Set();
        intents.forEach(intent => {
            intent.phrases.forEach(phrase => {
                phrase.toLowerCase().split(' ').forEach(word => {
                    dictionary.add(word);
                });
            });
        });
        
        const wordList = Array.from(dictionary);
        
        const vector = new Array(50).fill(0);
        const words = text.toLowerCase().split(' ');
        
        words.forEach(word => {
            const index = wordList.indexOf(word);
            if (index !== -1 && index < 50) {
                vector[index] = 1;
            }
        });
        
        return vector;
    };

    const predictIntent = (text) => {
        const query = text.toLowerCase().trim();
        
        let bestMatch = null;
        let highestScore = 0;
        
        for (const intent of intents) {
            for (const phrase of intent.phrases) {
                if (query === phrase.toLowerCase()) {
                    return intent.intent;
                }
                
                if (query.includes(phrase.toLowerCase())) {
                    const score = phrase.length / query.length;
                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = intent.intent;
                    }
                }
            }
            
            const keywords = intent.intent.split('_');
            for (const keyword of keywords) {
                if (keyword.length > 2 && query.includes(keyword)) {
                    const score = 0.7 * (keyword.length / query.length);
                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = intent.intent;
                    }
                }
            }
        }
        
        if (highestScore > 0.3 && bestMatch) {
            return bestMatch;
        }
        
        try {
            if (model) {
                const inputVector = vectorizeText(text);
                
                const prediction = model.predict(tf.tensor([inputVector]));
                const intentIndex = prediction.argMax(1).dataSync()[0];
                
                const confidence = prediction.max().dataSync()[0];
                
                if (confidence > 0.4) {
                    return intents[intentIndex].intent;
                }
            }
        } catch (error) {
            console.error("Error in ML prediction:", error);
        }
        
        return 'unknown';
    };

    const generateLocalResponse = (query) => {
        try {
            console.log("Processing query locally:", query);
            
            const predictedIntent = predictIntent(query.toLowerCase());
            console.log("Predicted intent:", predictedIntent);
            
            const matchedIntent = intents.find(item => item.intent === predictedIntent);
            
            if (predictedIntent === 'greeting') {
                const greetingResponses = [
                    "Hello! I'm your AI legal assistant. How can I help you with Indian legal matters today?",
                    "Hi there! I'm here to assist you with questions about Indian law. What would you like to know?",
                    "Greetings! I'm your AI legal assistant specializing in Indian law. What legal information do you need?"
                ];
                return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
            }
            
            if (matchedIntent) {
                return matchedIntent.response;
            }
            
            const fallbackResponses = [
                "I'm not sure about that specific legal matter. For complex legal issues, I recommend consulting with a qualified lawyer. Can I help you with something else related to Indian law?",
                "That's a bit outside my current knowledge base. Could you ask about a specific Indian law, like rights, FIR, divorce, or property laws?",
                "I don't have enough information on that topic. Would you like to know about fundamental rights, bail provisions, or filing an RTI instead?"
            ];
            
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        } catch (error) {
            console.error("Error generating local response:", error);
            return "I encountered an error processing your request. Please try asking something about Indian law, like fundamental rights or filing an FIR.";
        }
    };

    const generateResponse = async (query) => {
        if (useGeminiApi && geminiApiKey && apiStatus.ok) {
            try {
                console.log("Calling Gemini API...");
                const response = await getGeminiResponse(query, geminiApiKey, "gemini-pro", debugMode);
                
                if (apiStatus.errorCount > 0) {
                    setApiStatus(prev => ({
                        ...prev,
                        errorCount: 0,
                        ok: true,
                        message: ''
                    }));
                }
                
                return response;
            } catch (error) {
                console.error("Error with Gemini API, falling back to local model:", error);
                
                setApiStatus(prev => ({
                    ok: false,
                    message: `API error: ${error.message}. Using fallback model.`,
                    errorCount: prev.errorCount + 1,
                    lastChecked: new Date(),
                    isChecking: false
                }));
                
                return generateLocalResponse(query);
            }
        } else {
            return generateLocalResponse(query);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        const userQuery = input;
        setInput('');
        setIsTyping(true);

        try {
            const botResponse = await generateResponse(userQuery);
            
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
        } catch (err) {
            console.error("Error in response generation:", err);
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: "I'm sorry, I encountered an error. Please try asking a different question about Indian law.",
                sender: 'bot',
                timestamp: new Date()
            }]);
            
            if (useGeminiApi) {
                setApiStatus(prev => ({
                    ok: false,
                    message: "Critical error encountered. Using fallback model.",
                    errorCount: prev.errorCount + 1,
                    lastChecked: new Date()
                }));
            }
        } finally {
            setIsTyping(false);
        }
    };

    const retryApiConnection = async () => {
        setApiStatus(prev => ({ ...prev, isChecking: true }));
        
        try {
            const result = await checkGeminiApiAvailability(geminiApiKey, debugMode);
            
            if (result.available) {
                setApiStatus({
                    ok: true,
                    message: '',
                    errorCount: 0,
                    lastChecked: new Date(),
                    isChecking: false
                });
                
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: "Successfully reconnected to Gemini API. You can now continue your conversation.",
                    sender: 'bot',
                    timestamp: new Date()
                }]);
            } else {
                setApiStatus({
                    ok: false,
                    message: `Connection issue: ${result.message}. Using fallback model.`,
                    errorCount: apiStatus.errorCount + 1,
                    lastChecked: new Date(),
                    isChecking: false
                });
                
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: `Unable to connect to Gemini API: ${result.message}. Continuing with local fallback model.`,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            setApiStatus({
                ok: false,
                message: `Connection failed: ${error.message}`,
                errorCount: apiStatus.errorCount + 1,
                lastChecked: new Date(),
                isChecking: false
            });
            
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: `Connection to Gemini API failed: ${error.message}. Continuing with local fallback model.`,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    };

    const runDiagnostics = async () => {
        setIsDiagnosing(true);
        setDiagnosticReport('Running diagnostics, please wait...');
        
        try {
            const report = await generateDiagnosticReport(geminiApiKey);
            setDiagnosticReport(report);
        } catch (error) {
            console.error("Error running diagnostics:", error);
            setDiagnosticReport(`Error running diagnostics: ${error.message}`);
        } finally {
            setIsDiagnosing(false);
        }
    };

    const toggleDiagnosticMode = () => {
        setDiagnosticMode(prev => !prev);
        if (!diagnosticMode && !diagnosticReport) {
            runDiagnostics();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const toggleApiMode = () => {
        setUseGeminiApi(prev => !prev);
    };

    const toggleDebugMode = () => {
        setDebugMode(prev => !prev);
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <button className="back-button" onClick={handleBackToHome}>
                    <FaArrowLeft /> Back
                </button>
                <h2><FaRobot /> Indian Law AI Chatbot</h2>
                <div className="api-controls">
                    <label className="api-toggle">
                        <input 
                            type="checkbox" 
                            checked={useGeminiApi} 
                            onChange={toggleApiMode} 
                        />
                        Use Gemini API
                    </label>
                    {useGeminiApi && (
                        <>
                            <button 
                                className={`debug-button ${debugMode ? 'active' : ''}`}
                                onClick={toggleDebugMode}
                                title="Toggle Debug Mode"
                            >
                                <FaBug />
                            </button>
                            <button 
                                className={`diagnostic-button ${diagnosticMode ? 'active' : ''}`}
                                onClick={toggleDiagnosticMode}
                                title="API Diagnostics"
                            >
                                <FaStethoscope />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!apiStatus.ok && (
                <div className="api-warning">
                    <FaExclamationTriangle /> 
                    <span>{apiStatus.message}</span>
                    <button 
                        className="retry-button" 
                        onClick={retryApiConnection}
                        disabled={apiStatus.isChecking}
                    >
                        {apiStatus.isChecking ? 'Checking...' : 'Retry Connection'}
                    </button>
                </div>
            )}

            {debugMode && (
                <div className="debug-panel">
                    <h4>Debug Information</h4>
                    <div className="debug-info">
                        <p>API Status: {apiStatus.ok ? '✅ Connected' : '❌ Disconnected'}</p>
                        <p>Error Count: {apiStatus.errorCount}</p>
                        <p>Last Checked: {apiStatus.lastChecked ? apiStatus.lastChecked.toLocaleTimeString() : 'Never'}</p>
                        <p>API Key: {geminiApiKey ? `${geminiApiKey.substring(0, 5)}...${geminiApiKey.substring(geminiApiKey.length - 4)}` : 'Missing'}</p>
                    </div>
                </div>
            )}

            {diagnosticMode && (
                <div className="diagnostic-panel">
                    <div className="diagnostic-header">
                        <h4>API Diagnostics</h4>
                        <button 
                            className="run-diagnostics-button" 
                            onClick={runDiagnostics}
                            disabled={isDiagnosing}
                        >
                            {isDiagnosing ? 'Running...' : 'Run Diagnostics'}
                        </button>
                    </div>
                    <pre className="diagnostic-report">{diagnosticReport}</pre>
                </div>
            )}

            {isModelLoading ? (
                <div className="model-loading">
                    <div className="loader"></div>
                    <p>Loading AI model...</p>
                </div>
            ) : (
                <div className="chatbot-messages">
                    {messages.map(message => (
                        <div 
                            key={message.id} 
                            className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                        >
                            <div className="message-icon">
                                {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
                            </div>
                            <div className="message-content">
                                <div className="message-text">{message.text}</div>
                                <div className="message-timestamp">{formatTime(message.timestamp)}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message bot-message typing">
                            <div className="message-icon">
                                <FaRobot />
                            </div>
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
            )}

            <form className="chatbot-input-form" onSubmit={handleSubmit} disabled={isModelLoading}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Indian laws, rights, or legal procedures..."
                    className="chatbot-input"
                    disabled={isModelLoading}
                />
                <button type="submit" className="send-button" disabled={isModelLoading}>
                    <FaPaperPlane />
                </button>
            </form>

            <div className="chatbot-footer">
                <p>
                    This {useGeminiApi ? (apiStatus.ok ? 'Gemini API-powered' : 'fallback') : 'ML-powered'} 
                    AI assistant provides general information about Indian laws. For specific legal advice, 
                    please consult a qualified lawyer.
                </p>
            </div>
        </div>
    );
};

export default AILegalChatbot;
