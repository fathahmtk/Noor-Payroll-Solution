# Noor HR — Qatar Payroll SaaS (Google Cloud)

A comprehensive HR & Payroll SaaS application ready for deployment on Google Cloud.

## Features
- React Frontend with Vite build system
- Backend API for Gemini powered by Google Cloud Functions
- Containerized deployment with Docker for Google Cloud Run
- CI/CD pipeline using Google Cloud Build
- Secure API key management using environment variables on the backend

## Google Cloud Deployment

This application is configured for easy deployment to Google Cloud using Cloud Run for the frontend and Cloud Functions for the backend API.

### Prerequisites
1. A Google Cloud Project with billing enabled.
2. `gcloud` CLI installed and configured.
3. Your Gemini API Key.

### Steps:
1.  **Enable APIs:**
    In your Google Cloud project, enable the following APIs:
    - Cloud Build API
    - Cloud Run API
    - Cloud Functions API
    - Secret Manager API
    - Identity and Access Management (IAM) API

2.  **Store API Key in Secret Manager:**
    It's best practice to store your Gemini API key securely.
    ```bash
    gcloud secrets create gemini-api-key --replication-policy="automatic"
    echo "YOUR_API_KEY_HERE" | gcloud secrets versions add gemini-api-key --data-file=-
    ```

3.  **Set Up Cloud Build Trigger:**
    - Fork this repository to your GitHub account.
    - In the GCP Console, go to Cloud Build > Triggers.
    - Connect your GitHub repository.
    - Create a new trigger:
        - **Name:** Deploy Noor HR
        - **Event:** Push to a branch
        - **Branch:** `main` (or your preferred branch)
        - **Configuration:** Cloud Build configuration file (`cloudbuild.yaml`)
        - **Substitution Variables:**
            - `_API_KEY_SECRET_VERSION`: The full resource name of your secret version, e.g., `projects/YOUR_PROJECT_ID/secrets/gemini-api-key/versions/latest`
            (Replace `YOUR_PROJECT_ID` with your GCP project ID)

4.  **Get Cloud Function URL:**
    - After the first successful Cloud Build run, your Cloud Function will be deployed.
    - Find its URL in the GCP Console under Cloud Functions > noorHrApi > Trigger.
    - Update the `CLOUD_FUNCTION_URL` constant in `services/geminiService.ts` with this URL.
    - Commit and push this change to trigger another build.

5.  **Access Your Application:**
    - After the second build finishes, your frontend will be deployed on Cloud Run.
    - Find its URL in the GCP Console under Cloud Run > noor-hr-frontend.

### Local Development
1.  **Install Dependencies:** `npm install`
2.  **Run Frontend Dev Server:** `npm run dev` (Frontend will be available at `http://localhost:5173`)
3.  **Run Backend Functions Locally:**
    - `cd cloud-functions`
    - `npm install`
    - Create a `.env` file in the `cloud-functions` directory with `API_KEY=YOUR_API_KEY`
    - `npm start` (Functions will be available at `http://localhost:8080`)
    - Update `CLOUD_FUNCTION_URL` in `services/geminiService.ts` to `http://localhost:8080` for local testing.