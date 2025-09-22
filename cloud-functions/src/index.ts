import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
  // We don't throw an error here to allow the function to deploy,
  // but it will fail at runtime if the key is not provided.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const app = express();

// Use cors middleware and allow all origins
app.use(cors({ origin: true }));
app.use(express.json());

const handleGeminiRequest = async (req: express.Request, res: express.Response, promptGenerator: (body: any) => string, systemInstruction?: string) => {
    if (!API_KEY) {
        return res.status(500).json({ error: "API_KEY is not configured on the server." });
    }
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing.' });
        }
        const prompt = promptGenerator(req.body);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              ...(systemInstruction && { systemInstruction }),
            }
        });
        res.status(200).json({ text: response.text });
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: `Failed to generate content: ${error.message}` });
    }
};

app.post('/generateJobDescription', (req, res) => handleGeminiRequest(req, res, body => `Generate a concise and professional job description for the role of "${body.jobTitle}" at a technology company based in Doha, Qatar. The description should be around 100-150 words and include key responsibilities and qualifications. Do not use markdown.`));

app.post('/getHRAssistantResponse', (req, res) => handleGeminiRequest(req, res, body => `An employee has asked the following question: "${body.query}"`, `You are an AI HR Assistant for a company in Qatar named "Noor HR". Your role is to answer employee questions based on general Qatar Labor Law and common HR policies. Keep your answers concise, professional, and friendly. Do not answer questions outside the scope of HR. If you don't know the answer, say "I don't have information on that, but I recommend speaking with our HR Manager, Yusuf Ahmed."
  Key facts about the company policies:
  - Annual leave: 21 days for employees with less than 5 years of service, 28 days for 5+ years.
  - Sick leave: First 2 weeks at 100% pay, next 4 weeks at 50%. A medical certificate is required.
  - Working hours: 8 AM to 5 PM, Sunday to Thursday.
  - The HR Manager's name is Yusuf Ahmed.`));

app.post('/getAppSupportResponse', (req, res) => handleGeminiRequest(req, res, body => `A user has asked for help with the Noor HR application. Their question is: "${body.query}"`, `You are an AI support agent for a software application called "Noor HR". Your purpose is to help users understand and use the application's features. Be friendly, clear, and provide step-by-step instructions when necessary. Do not answer questions unrelated to the Noor HR application.

  Here is a summary of the application's features:
  - Dashboard: Shows key stats like employee count and payroll costs.
  - Employees: A list of all employees. Users can add, edit, or view employee profiles.
  - Org Chart: A visual representation of the company hierarchy.
  - Payroll & WPS: Users can run monthly payroll, which generates a WPS-compliant SIF file for the bank.
  - Time & Attendance: Manage leave requests and balances, and log attendance.
  - Documents: Upload and manage employee documents like QIDs and passports.
  - Asset Management: Track company assets (laptops, vehicles) and their assignment to employees.
  - Settings: Manage company details, users, and roles.
  - Help & Support: The section you are in right now.

  When a user asks how to do something, provide a simple guide. For example, if they ask "How do I add an employee?", you should respond with something like:
  "To add a new employee, you can follow these simple steps:
  1. Navigate to the 'Employees' view from the main sidebar.
  2. Click the 'New Employee' button at the top.
  3. Fill in the required details in the form that appears.
  4. Click 'Add Employee' to save."`));

app.post('/generateHRPolicy', (req, res) => handleGeminiRequest(req, res, body => `Generate a comprehensive and professional HR policy document for a company in Qatar named "Noor HR" on the topic of '${body.topic}'. The policy should be well-structured with clear sections, headings, and bullet points. It should be written in a formal tone appropriate for an official company document. Do not use markdown.`));

app.post('/getAdminAssistantResponse', (req, res) => handleGeminiRequest(req, res, body => `The user has asked the following question: "${body.query}"`, `You are an advanced AI HR Analyst for a company named "Noor HR". You have been provided with a JSON string containing the company's current data (employees, payroll runs, etc.). Your task is to answer questions based ONLY on this data. Be concise and professional. If the user asks for something not in the data, state that the information is not available in the provided context. Do not invent data. Present lists or tables in a clean, readable format without using markdown.

Here is the company data:
${req.body.dataContext}`));

app.post('/generateKnowledgeBaseArticle', (req, res) => handleGeminiRequest(req, res, body => `Generate a professional, well-structured knowledge base article for a company named "${body.companyName}". The topic is "${body.topic}". The article should be ready to be published internally for employees. It should be clear, concise, and formatted with logical sections and paragraphs. Do not use markdown.`));

functions.http('noorHrApi', app);
