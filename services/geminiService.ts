import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateContentWithPlaceholder = async (prompt: string, placeholder: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve(placeholder);
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Failed to generate response. Please check the console for errors.";
  }
};


export const generateJobDescription = async (jobTitle: string): Promise<string> => {
  const prompt = `Generate a concise and professional job description for the role of "${jobTitle}" at a technology company based in Doha, Qatar. The description should be around 100-150 words and include key responsibilities and qualifications. Do not use markdown.`;
  const placeholder = `This is a placeholder job description for a ${jobTitle}. To generate a real one, please configure your Gemini API key.`;
  return generateContentWithPlaceholder(prompt, placeholder);
};

export const getHRAssistantResponse = async (query: string): Promise<string> => {
  const systemInstruction = `You are an AI HR Assistant for a company in Qatar named "Noor Payroll Solutions". Your role is to answer employee questions based on general Qatar Labor Law and common HR policies. Keep your answers concise, professional, and friendly. Do not answer questions outside the scope of HR. If you don't know the answer, say "I don't have information on that, but I recommend speaking with our HR Manager, Yusuf Ahmed."
  Key facts about the company policies:
  - Annual leave: 21 days for employees with less than 5 years of service, 28 days for 5+ years.
  - Sick leave: First 2 weeks at 100% pay, next 4 weeks at 50%. A medical certificate is required.
  - Working hours: 8 AM to 5 PM, Sunday to Thursday.
  - The HR Manager's name is Yusuf Ahmed.
  `;
  
  const prompt = `An employee has asked the following question: "${query}"`;
  const placeholder = `Thank you for your question about "${query}". For a detailed answer, please speak with our HR Manager, Yusuf Ahmed. To get real AI-powered answers, please configure your Gemini API key.`;

  if (!process.env.API_KEY) {
    return Promise.resolve(placeholder);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating HR assistant response:", error);
    return "I'm sorry, I encountered an error and can't answer right now. Please try again later.";
  }
};
