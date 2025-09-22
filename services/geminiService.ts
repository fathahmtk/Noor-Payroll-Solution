// IMPORTANT: After deploying your Google Cloud Function, update this URL.
// It should be the trigger URL of your 'noorHrApi' function.
const CLOUD_FUNCTION_URL = 'YOUR_CLOUD_FUNCTION_URL'; 

const callApi = async (endpoint: string, body: object, placeholder: string): Promise<string> => {
    // This provides a fallback for local development before the function is deployed.
    if (CLOUD_FUNCTION_URL === 'YOUR_CLOUD_FUNCTION_URL' || !CLOUD_FUNCTION_URL) {
        console.warn(`Cloud Function URL not set in services/geminiService.ts. Using placeholder response for ${endpoint}.`);
        return Promise.resolve(placeholder);
    }

    try {
        const response = await fetch(`${CLOUD_FUNCTION_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
        }

        const data = await response.json();
        return data.text || "No response text found.";
    } catch (error) {
        console.error(`Error calling /${endpoint}:`, error);
        return `Failed to generate response. Please check the console for errors.`;
    }
};

export const generateJobDescription = (jobTitle: string): Promise<string> => {
    return callApi('generateJobDescription', { jobTitle }, `This is a placeholder job description for a ${jobTitle}. To generate a real one, please deploy the Google Cloud Functions and set the URL in services/geminiService.ts.`);
};

export const getHRAssistantResponse = (query: string): Promise<string> => {
    return callApi('getHRAssistantResponse', { query }, `Thank you for your question about "${query}". For a detailed answer, please speak with our HR Manager, Yusuf Ahmed. To get real AI-powered answers, please deploy the backend functions.`);
};

export const getAppSupportResponse = (query: string): Promise<string> => {
    return callApi('getAppSupportResponse', { query }, `I can help with questions like "How do I run payroll?". To get real AI-powered answers, please deploy the backend functions.`);
};

export const generateHRPolicy = (topic: string): Promise<string> => {
    return callApi('generateHRPolicy', { topic }, `This is a placeholder for a company policy on "${topic}". To generate a real one, please deploy the backend functions.`);
};

export const getAdminAssistantResponse = (query: string, dataContext: string): Promise<string> => {
    return callApi('getAdminAssistantResponse', { query, dataContext }, `I can answer questions like "How many employees are in the Engineering department?". To get real AI-powered answers, please deploy the backend functions.`);
};

export const generateKnowledgeBaseArticle = (topic: string, companyName: string): Promise<string> => {
    return callApi('generateKnowledgeBaseArticle', { topic, companyName }, `This is a placeholder for a knowledge base article on "${topic}". To get real one, please deploy the backend functions.`);
};
