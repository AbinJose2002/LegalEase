/**
 * Utilities for debugging API connectivity issues
 */
import { verifyGeminiApiKey } from './geminiApi';

/**
 * Test internet connectivity 
 * @returns {Promise<boolean>} True if internet is available
 */
export const checkInternetConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("Internet connection check failed:", error);
    return false;
  }
};

/**
 * Check if the Gemini API endpoint is directly accessible
 * @returns {Promise<boolean>} True if endpoint is reachable
 */
export const checkGeminiEndpoint = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Just try to reach the base endpoint without authentication
    const response = await fetch('https://generativelanguage.googleapis.com/', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    // Even if we get an error response, it means we can reach the server
    return response.status !== 0;
  } catch (error) {
    console.error("Gemini endpoint check failed:", error);
    
    // Check if it's a CORS issue
    if (error.name === 'TypeError' && 
        (error.message.includes('CORS') || error.message.includes('Cross-Origin'))) {
      console.warn("CORS issue detected with Gemini API");
      return false;
    }
    
    return false;
  }
};

/**
 * Run diagnostics on API connectivity issues
 * @param {string} apiKey - API key to test
 * @returns {Promise<Object>} Diagnostic results
 */
export const runApiDiagnostics = async (apiKey) => {
  console.log("Starting API diagnostics...");
  
  const results = {
    internetConnected: false,
    apiKeyFormat: false,
    apiKeyValid: false,
    corsIssue: false,
    endpointReachable: false,
    diagnosticTime: new Date().toISOString(),
  };
  
  // Step 1: Check internet connectivity
  console.log("Checking internet connection...");
  results.internetConnected = await checkInternetConnection();
  console.log(`Internet connection: ${results.internetConnected ? 'OK' : 'FAILED'}`);
  
  if (!results.internetConnected) {
    return {
      ...results,
      conclusion: "No internet connection detected. Please check your network connection."
    };
  }
  
  // Step 2: Test API key format
  console.log("Checking API key format...");
  if (!apiKey) {
    return {
      ...results,
      conclusion: "API key is missing. Please provide a valid Gemini API key in your .env file."
    };
  }
  
  results.apiKeyFormat = apiKey.startsWith('AIza') && apiKey.length >= 35;
  console.log(`API key format: ${results.apiKeyFormat ? 'OK' : 'SUSPICIOUS'}`);
  
  if (!results.apiKeyFormat) {
    return {
      ...results,
      conclusion: "API key appears to be invalid (doesn't match expected format)."
    };
  }
  
  // Step 3: Check if Gemini API endpoint is reachable
  console.log("Checking if API endpoint is reachable...");
  results.endpointReachable = await checkGeminiEndpoint();
  console.log(`API endpoint reachable: ${results.endpointReachable ? 'OK' : 'FAILED'}`);
  
  if (!results.endpointReachable) {
    // Try to determine if it's a CORS issue
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/');
      console.log("Unexpected successful response:", response);
    } catch (error) {
      if (error.name === 'TypeError' && 
          (error.message.includes('CORS') || error.message.includes('Cross-Origin'))) {
        results.corsIssue = true;
        return {
          ...results,
          conclusion: "CORS policy issue detected. This may be due to browser restrictions. Try running your app on a proper server or using a CORS proxy."
        };
      }
    }
    
    return {
      ...results,
      conclusion: "Cannot reach Gemini API servers. The service might be down or blocked by your network."
    };
  }
  
  // Step 4: Verify API key with the service
  console.log("Verifying API key with Google AI Studio...");
  const verification = await verifyGeminiApiKey(apiKey, true);
  results.apiKeyValid = verification.valid;
  console.log(`API key verification: ${verification.valid ? 'VALID' : 'INVALID'} - ${verification.message}`);
  
  if (!verification.valid) {
    return {
      ...results,
      conclusion: `API key appears invalid: ${verification.message}. Please check your API key in the Google AI Studio.`
    };
  }
  
  return {
    ...results,
    conclusion: "All basic checks passed. Your system should be able to connect to the Gemini API."
  };
};

/**
 * Generate a diagnostic report for troubleshooting
 * @param {string} apiKey - The API key to test
 * @returns {Promise<string>} Formatted diagnostic report
 */
export const generateDiagnosticReport = async (apiKey) => {
  const diagnostics = await runApiDiagnostics(apiKey);
  const report = [
    "== GEMINI API DIAGNOSTIC REPORT ==",
    `Time: ${new Date().toLocaleString()}`,
    `Internet Connection: ${diagnostics.internetConnected ? '✅ Connected' : '❌ Not Connected'}`,
    `API Key Format: ${diagnostics.apiKeyFormat ? '✅ Valid Format' : '❌ Invalid Format'}`,
    `API Key Valid: ${diagnostics.apiKeyValid ? '✅ Verified' : '❌ Invalid'}`,
    `API Endpoint Reachable: ${diagnostics.endpointReachable ? '✅ Reachable' : '❌ Not Reachable'}`,
    `CORS Issues Detected: ${diagnostics.corsIssue ? '⚠️ Yes' : '✅ No'}`,
    "",
    "CONCLUSION:",
    diagnostics.conclusion,
    "",
    "RECOMMENDATIONS:",
    diagnostics.internetConnected ? '✅ Internet connection OK' : '❌ Check your internet connection',
    diagnostics.apiKeyFormat ? '✅ API key format OK' : '❌ Get a proper API key from Google AI Studio',
    diagnostics.apiKeyValid ? '✅ API key is valid' : '❌ The API key was rejected by Google AI Studio',
    diagnostics.endpointReachable ? '✅ API endpoint is reachable' : '❌ Check if the API endpoint is blocked by your network',
    diagnostics.corsIssue ? '❌ Fix CORS issues by running on a proper server' : '✅ No CORS issues detected',
  ].join('\n');
  
  return report;
};
