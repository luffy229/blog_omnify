// Determine the base API URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Function to get the full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if it exists in the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Construct and return the full URL
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Export as default for convenience
export default getApiUrl; 