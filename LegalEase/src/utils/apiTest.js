/**
 * API testing utilities specifically for Google AI Studio
 */

/**
 * Test if the API key is valid by connecting to Google AI Studio
 * 
 * @param {string} apiKey - The API key to test
 * @returns {Promise<Object>} Test result with detailed information
 */
export const testApiKey = async (apiKey) => {
  if (!apiKey) {
    return {
      success: false,
      error: "No API key provided",
      details: "Please provide a valid Google AI Studio API key"
    };
  }
  
  try {
    // First try a simple endpoint that just checks authentication
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log("Testing API key with models endpoint");
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        models: data.models?.length || 0,
        details: "API key is valid and working correctly"
      };
    }
    
    // If not successful, get the error message
    const errorText = await response.text();
    let errorJson;
    
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {
      // Not JSON
    }
    
    return {
      success: false,
      status: response.status,
      error: errorJson?.error?.message || "Unknown error",
      details: errorText
    };
  } catch (error) {
    return {
      success: false,
      error: error.name,
      details: error.message,
      isNetworkError: error.name === 'TypeError'
    };
  }
};

/**
 * Test a complete API request with the Gemini model
 * 
 * @param {string} apiKey - The API key to use
 * @returns {Promise<Object>} Test result
 */
export const testGeminiRequest = async (apiKey) => {
  if (!apiKey) {
    return {
      success: false,
      error: "No API key provided"
    };
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Hello, this is a test request. Please respond with 'API is working correctly'."
          }
        ]
      }
    ]
  };
  
  try {
    console.log("Sending test request to Gemini API");
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const data = await response.json();
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text";
      
      return {
        success: true,
        status: response.status,
        responseTime,
        responseText,
        details: "API request successful"
      };
    }
    
    const errorText = await response.text();
    let errorJson;
    
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {
      // Not JSON
    }
    
    return {
      success: false,
      status: response.status,
      responseTime,
      error: errorJson?.error?.message || "Unknown error",
      details: errorText
    };
  } catch (error) {
    return {
      success: false,
      error: error.name,
      details: error.message,
      isNetworkError: error.name === 'TypeError' || error.name === 'AbortError'
    };
  }
};

/**
 * Run a comprehensive set of tests on the API connection
 * 
 * @param {string} apiKey - The API key to test
 * @returns {Promise<Object>} Complete test results
 */
export const runComprehensiveTests = async (apiKey) => {
  console.log("Starting comprehensive API tests...");
  
  const results = {
    keyValidation: null,
    basicRequest: null,
    timestamp: new Date().toISOString()
  };
  
  // Test 1: API Key Validation
  results.keyValidation = await testApiKey(apiKey);
  console.log("Key validation result:", results.keyValidation.success ? "Success" : "Failed");
  
  // Only proceed with other tests if the key is valid
  if (results.keyValidation.success) {
    // Test 2: Basic Request
    results.basicRequest = await testGeminiRequest(apiKey);
    console.log("Basic request result:", results.basicRequest.success ? "Success" : "Failed");
  }
  
  // Overall assessment
  results.success = results.keyValidation.success && 
                    (results.basicRequest ? results.basicRequest.success : false);
  
  if (results.success) {
    results.conclusion = "All tests passed. The API is working correctly.";
  } else if (!results.keyValidation.success) {
    results.conclusion = "The API key validation failed. Please check your API key.";
  } else {
    results.conclusion = "The API key is valid, but the request failed. There might be an issue with the request format or the API service.";
  }
  
  return results;
};

/**
 * Generate a human-readable report from test results
 * 
 * @param {Object} testResults - Results from comprehensive tests
 * @returns {string} Formatted report
 */
export const generateTestReport = (testResults) => {
  if (!testResults) {
    return "No test results available";
  }
  
  const lines = [
    "=== GOOGLE AI STUDIO API TEST REPORT ===",
    `Timestamp: ${new Date(testResults.timestamp).toLocaleString()}`,
    "",
    "1. API KEY VALIDATION",
    `   Result: ${testResults.keyValidation.success ? '✅ PASSED' : '❌ FAILED'}`,
    testResults.keyValidation.success 
      ? `   Details: Found ${testResults.keyValidation.models} available models`
      : `   Error: ${testResults.keyValidation.error}`,
    "",
  ];
  
  if (testResults.basicRequest) {
    lines.push(
      "2. BASIC REQUEST TEST",
      `   Result: ${testResults.basicRequest.success ? '✅ PASSED' : '❌ FAILED'}`,
      `   Response Time: ${testResults.basicRequest.responseTime}ms`,
      testResults.basicRequest.success 
        ? `   Response: "${testResults.basicRequest.responseText.substring(0, 50)}..."`
        : `   Error: ${testResults.basicRequest.error}`,
      "",
    );
  }
  
  lines.push(
    "=== CONCLUSION ===",
    testResults.conclusion,
    "",
    "=== RECOMMENDATIONS ===",
  );
  
  if (!testResults.success) {
    if (!testResults.keyValidation.success) {
      lines.push(
        "1. Verify your API key in Google AI Studio",
        "2. Make sure the API key has access to the Gemini API",
        "3. Check if your API key has billing enabled if required",
        "4. Try generating a new API key"
      );
    } else {
      lines.push(
        "1. Check if there are any quotas or limitations on your API key",
        "2. Verify your network connection and firewall settings",
        "3. Check if there are any CORS issues if running in a browser"
      );
    }
  } else {
    lines.push("Your API setup is working correctly!");
  }
  
  return lines.join('\n');
};

export default {
  testApiKey,
  testGeminiRequest,
  runComprehensiveTests,
  generateTestReport
};
