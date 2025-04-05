/**
 * Utility for interacting with the Google Gemini API
 */

// API base URL for Gemini
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Implements exponential backoff retry logic for API calls
 * 
 * @param {Function} apiCall - The async function to call
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} - Result of the API call
 */
const withRetry = async (apiCall, maxRetries = 3, baseDelay = 300) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`API attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes("Authentication error") || 
          error.message.includes("blocked by safety settings") ||
          error.message.includes("Invalid request")) {
        throw error;
      }
      
      // Don't wait on the last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we got here, all attempts failed
  throw lastError;
};

/**
 * Validates if the provided API key appears to be in the correct format
 * 
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} - Whether the API key appears valid
 */
const isValidApiKeyFormat = (apiKey) => {
  // Basic validation: Google API keys typically start with "AIza" and are around 39 chars
  return apiKey && 
    typeof apiKey === 'string' && 
    apiKey.startsWith('AIza') && 
    apiKey.length >= 35;
};

/**
 * Sends a prompt to the Google Gemini API and returns the response
 * 
 * @param {string} prompt - The user prompt to send to Gemini
 * @param {string} apiKey - The Gemini API key
 * @param {string} model - The model to use (default: "gemini-pro")
 * @param {boolean} debug - Whether to log debug information
 * @returns {Promise<string>} The API response text
 */
export const getGeminiResponse = async (prompt, apiKey, model = "gemini-pro", debug = false) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  if (!isValidApiKeyFormat(apiKey)) {
    throw new Error("Gemini API key appears to be invalid. Please check your API key format.");
  }

  const url = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
  
  const makeApiCall = async () => {
    // Create a system prompt to guide the model's behavior
    const systemPrompt = `
      You are an AI legal assistant specialized in Indian law. Your role is to:
      1. Provide accurate information about Indian legal system, codes, and procedures
      2. Explain legal concepts in clear, concise language
      3. Cite relevant sections of Indian legal codes when applicable
      4. Maintain a professional, helpful tone
      5. Acknowledge limitations when a question requires specialized legal advice
      
      Please respond to the following query about Indian law:
    `;

    if (debug) {
      console.log("🔍 API Debug: Preparing request to Gemini API");
      console.log("🔍 API Debug: API URL:", url.replace(apiKey, "API_KEY_HIDDEN"));
      console.log("🔍 API Debug: Using model:", model);
      console.log("🔍 API Debug: Prompt length:", prompt.length);
    }

    // Add timeout for fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt} ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      if (debug) {
        console.log("🔍 API Debug: Request body:", JSON.stringify(requestBody, null, 2));
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (debug) {
        console.log("🔍 API Debug: Response received");
        console.log("🔍 API Debug: Status:", response.status, response.statusText);
        console.log("🔍 API Debug: Headers:", Object.fromEntries([...response.headers]));
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        
        try {
          // Try to parse the error response if it's JSON
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            throw new Error(`${errorJson.error.message} (${errorJson.error.status})`);
          }
        } catch (parseError) {
          // If parsing fails, use the standard error handling
        }
        
        // Create more specific error objects based on HTTP status
        if (response.status === 400) {
          throw new Error("Invalid request to Gemini API. Please check your prompt.");
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication error. Please check your API key.");
        } else if (response.status === 404) {
          throw new Error("Model not found. Please check the model name.");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status >= 500) {
          throw new Error("Gemini API server error. Please try again later.");
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (debug) {
        console.log("🔍 API Debug: Response data structure:", Object.keys(data));
      }
      
      // Extract the text from the response
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        if (debug) {
          console.log("🔍 API Debug: Successfully extracted response");
        }
        return data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        // Handle content filtered by safety settings
        throw new Error(`Content was blocked by safety settings: ${data.promptFeedback.blockReason}`);
      } else {
        console.error("Unexpected API response structure:", JSON.stringify(data, null, 2));
        throw new Error("No response text found in API response");
      }
    } catch (error) {
      // Clean up timeout if there's an error
      clearTimeout(timeoutId);
      
      // Handle abort errors specially
      if (error.name === 'AbortError') {
        throw new Error("Request timeout. The Gemini API took too long to respond.");
      }
      
      if (debug) {
        console.error("🔍 API Debug: Error details:", error);
      }
      
      throw error;
    }
  };
  
  // Execute the API call with retry logic
  return await withRetry(makeApiCall);
};

/**
 * Check if the Gemini API is available by sending a test request
 * 
 * @param {string} apiKey - The Gemini API key
 * @param {boolean} debug - Whether to log debug information
 * @returns {Promise<{available: boolean, message: string}>} Result of the availability check
 */
export const checkGeminiApiAvailability = async (apiKey, debug = false) => {
  if (!apiKey) {
    return { 
      available: false, 
      message: "API key is missing" 
    };
  }
  
  if (!isValidApiKeyFormat(apiKey)) {
    return { 
      available: false, 
      message: "API key format appears invalid" 
    };
  }

  try {
    if (debug) {
      console.log("🔍 API Debug: Checking Gemini API availability...");
      console.log("🔍 API Debug: API key format check:", isValidApiKeyFormat(apiKey) ? "Valid" : "Invalid");
    }
    
    // First check if we can connect to the models endpoint (doesn't consume quota)
    const modelUrl = `${GEMINI_API_BASE_URL}/models?key=${apiKey}`;
    
    if (debug) {
      console.log("🔍 API Debug: Testing models endpoint:", modelUrl.replace(apiKey, "API_KEY_HIDDEN"));
    }
    
    try {
      const modelResponse = await fetch(modelUrl);
      
      if (debug) {
        console.log("🔍 API Debug: Models endpoint response:", modelResponse.status);
      }
      
      if (!modelResponse.ok) {
        const errorText = await modelResponse.text();
        return { 
          available: false, 
          message: `API connection issue: ${modelResponse.status} ${modelResponse.statusText}` 
        };
      }
    } catch (error) {
      if (debug) {
        console.log("🔍 API Debug: Models endpoint error:", error.message);
      }
      return { 
        available: false, 
        message: `Cannot connect to API: ${error.message}` 
      };
    }
    
    // If models endpoint works, try a simple content generation
    // Use a very simple test prompt that should be safe and quick to process
    const testPrompt = "Hello, this is a connection test.";
    
    // Start a timeout for the whole operation
    const result = await Promise.race([
      getGeminiResponse(testPrompt, apiKey, "gemini-pro", debug),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection test timed out after 10 seconds")), 10000)
      )
    ]);
    
    if (debug) {
      console.log("🔍 API Debug: Received API response:", result.substring(0, 50) + "...");
    }
    
    return { 
      available: true, 
      message: "API is connected and working" 
    };
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    
    if (debug) {
      console.warn("🔍 API Debug: API availability test failed:", errorMessage);
    }
    
    return { 
      available: false, 
      message: errorMessage
    };
  }
};

/**
 * Verify the API key directly with Google AI Studio
 * 
 * @param {string} apiKey - The API key to verify
 * @param {boolean} debug - Whether to show debug logs
 * @returns {Promise<{valid: boolean, message: string}>} Verification result
 */
export const verifyGeminiApiKey = async (apiKey, debug = false) => {
  if (!apiKey) {
    return { valid: false, message: "No API key provided" };
  }
  
  if (!isValidApiKeyFormat(apiKey)) {
    return { valid: false, message: "API key format is invalid" };
  }
  
  try {
    // Test the models endpoint which requires minimal permissions
    const url = `${GEMINI_API_BASE_URL}/models?key=${apiKey}`;
    
    if (debug) {
      console.log("🔍 API Debug: Verifying API key using models endpoint");
    }
    
    const response = await fetch(url);
    
    if (response.ok) {
      return { valid: true, message: "API key is valid" };
    }
    
    const errorText = await response.text();
    let errorMessage = `API returned status ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error && errorJson.error.message) {
        errorMessage = errorJson.error.message;
      }
    } catch (e) {
      // Use default error message if parsing fails
    }
    
    return { valid: false, message: errorMessage };
  } catch (error) {
    return { 
      valid: false, 
      message: `Connection error: ${error.message}` 
    };
  }
};
