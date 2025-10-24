export const getFriendlyErrorMessage = (error: any): string => {
  // Handle cases where error is not an object or has no message
  if (!error || typeof error.message !== 'string') {
    return 'An unexpected error occurred. Please check the console for details.';
  }

  const message = error.message.toLowerCase();

  // Specific API key / authentication errors from Google AI SDK
  if (message.includes("api key not valid") || message.includes("requested entity was not found")) {
    return "API Key not found or invalid. Please select a valid API key and try again.";
  }
  if (message.includes("permission denied") || message.includes("billing not enabled")) {
    return "API request failed. Your Google Cloud project may need billing enabled for this feature.";
  }

  // Content-related errors
  if (message.includes("safety policy violation") || message.includes("candidate was blocked")) {
    return "The request was blocked due to content safety policies. Please modify your prompt and try again.";
  }
  
  // Network errors
  if (message.includes("failed to fetch") || message.includes("network request failed")) {
      return "A network error occurred. Please check your internet connection and try again.";
  }
  
  // Rate limiting
  if (message.includes("resource has been exhausted") || message.includes("rate limit")) {
      return "You've made too many requests in a short period. Please wait a moment and try again.";
  }

  // Invalid argument (e.g., bad image data)
  if (message.includes("invalid argument")) {
      return "There was an issue with the provided input. If you uploaded a file, please ensure it's a valid format and try again."
  }

  // Return the original message as a fallback, it might be informative
  return error.message;
};
