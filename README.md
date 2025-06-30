# Interview AI Assistant

## Overview

The Interview AI Assistant is a React application designed to help job seekers prepare for interviews using AI-powered, tailored responses. By leveraging your resume and a job description, the application generates human-like answers to interview questions, enhancing your preparation and confidence.

## Features and Functionality

-   **AI-Powered Responses:** Utilizes the Gemini API to generate interview answers based on your resume and job description.
-   **Context Memory:** Remembers previous questions and answers to provide contextually relevant responses.
-   **Resume and Job Description Input:** Allows users to input their resume and job description to personalize the AI responses.
-   **Voice Input:** Supports voice input for asking questions, providing a hands-free experience.
-   **Live Suggestions:** Offers real-time suggestions to improve answers.
-   **User Authentication:** Implements user authentication using Firebase for secure access.
-   **Profile Management:** Provides a profile page for managing user information.
-   **Test Microphone:** A page where user can test the mic before starting the interview

## Technology Stack

-   **React:** A JavaScript library for building user interfaces.
-   **React Router:** A standard library for routing in React.
-   **Firebase:** A platform for building web and mobile applications, used for authentication.
-   **react-firebase-hooks:** React Hooks for Firebase.
-   **Tailwind CSS:** A utility-first CSS framework for styling the application.
-   **Vite:** A build tool that aims to provide a faster and leaner development experience for modern web projects.
-   **react-syntax-highlighter:** For code syntax highlighting.
-   **lucide-react:** A library of beautiful and consistent icons for React.
-   **class-variance-authority & tailwind-merge:** For creating reusable and type-safe component variants with Tailwind CSS.
-   **Gemini API:** Google's AI model used to generate responses and suggestions.
-   **useSpeechRecognition:** A custom hook for handling speech recognition in the application.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js:** Version 18 or higher.  You can download it from [nodejs.org](https://nodejs.org/).
-   **npm:** Node Package Manager, usually installed with Node.js.
-   **Firebase Account:**  Set up a project in Firebase to obtain your API keys.  See [firebase.google.com](https://firebase.google.com/).
-   **Gemini API Key:** Obtain a Gemini API key from Google Cloud. Make sure the Gemini API is enabled for your project.

## Installation Instructions

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/suryakant0111/interview-assistant_app.git
    cd interview-assistant_app
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Firebase:**

    -   Create a `.env` file in the root directory of the project.

    -   Add your Firebase configuration details to the `.env` file:

        ```
        VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
        VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
        VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
        VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
        VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
        VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
        VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        ```

        Replace `"YOUR_FIREBASE_*"` and `"YOUR_GEMINI_API_KEY"` with your actual Firebase and Gemini API credentials.

4.  **Start the Application:**

    ```bash
    npm run dev
    ```

    This command starts the development server. Open your browser and navigate to `http://localhost:5173` (or the port specified in the console) to view the application.

## Usage Guide

1.  **Login/Register:**

    -   If you are a new user, click on the "Sign up" link on the login page (`/`).
    -   Fill in your details and click "Register." A verification email will be sent to your registered email address.
    -   If you already have an account, enter your email and password on the login page and click "Login."
    -   Alternatively, log in with your Google account by clicking "Login with Google."

2.  **Navigate to Interview Page:**

    -   After logging in, you will be redirected to the Home page (`/`).
    -   Click on the "🚀 Start Interview" button or navigate to `/interview` to access the interview preparation tool.

3.  **Input Resume and Job Description:**

    -   On the interview page, you will find two forms: "Your Resume" and "Job Description."
    -   Paste your resume into the "Your Resume" textarea. You can also use the "Use Sample" button for a template.  Characters are counted as you type, and hints are provided to guide you.
    -   Paste the job description into the "Job Description" textarea.

4.  **Enter Position/Role:**

    -   Enter the position or role you are interviewing for in the input field provided (e.g., "Software Engineer").

5.  **Ask Questions and Receive AI-Powered Answers:**

    -   Type your interview question in the textarea at the bottom of the page.
    -   Press `Enter` (or click the "Ask" button) to submit the question.
    -   The AI will generate an answer based on your resume, job description, and the context of previous questions.

6.  **Use Voice Input:**

    -   Click on the microphone icon to start voice input.  The indicator dot will pulse red while listening.
    -   Speak your question clearly.
    -   Click the stop button to finalize the transcript. The final transcript will appear in the text box.

7.  **View Chat History:**

    -   The chat history displays your questions and the AI-generated answers in a chronological order.

8.  **Clear Chat History:**

    -   Click on the "Clear" button to clear the chat history and start a new session.

9.  **Live Suggestions**
    - As you type, the system provides real-time suggestions in a floating box which can be dragged and positioned anywhere on the screen.
    - The suggestion box has an auto-render feature that automatically applies the suggestion after a period of inactivity.

10. **Access and Manage Profile:**

    -   Click on the "Profile" link in the navigation bar to access your profile page (`/profile`).
    -   View your profile information, including your display name, email, last sign-in time, and account creation date.
    -   Refresh your profile information by clicking the "Refresh Profile" button.
    -   Sign out by clicking the "Sign Out" button.

11. **Test Microphone:**

    -   Click on the "test-mic" route in the `App.jsx` file
    -   Start and stop recording using start and stop button

## API Documentation

The application uses the Gemini API to generate interview answers and suggestions.

### Gemini API Endpoint

-   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

### API Key

-   You need to obtain a Gemini API key and include it in the `.env` file as `VITE_GEMINI_API_KEY`.

### API Functions

-   `fetchGeminiAnswer(question)`: Fetches an interview answer based on the given question.  Takes the question as a string.  Returns a string containing the generated answer.  See `src/lib/geminiApi.js`.

-   `fetchGeminiSuggestion(prompt)`: Fetches a suggestion based on the current text the user is typing. Takes the user inputted text as a string. Returns a string containing suggestion text. See `src/lib/geminiApi.js`.

## Contributing Guidelines

Contributions are welcome! Here are the steps to contribute:

1.  **Fork the Repository:** Fork the repository on GitHub.
2.  **Create a Branch:** Create a new branch for your feature or bug fix.

    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make Changes:** Implement your changes and ensure the code adheres to the project's coding standards.
4.  **Commit Changes:** Commit your changes with descriptive commit messages.

    ```bash
    git commit -m "Add: Implement your feature"
    ```

5.  **Push to GitHub:** Push your changes to your forked repository.

    ```bash
    git push origin feature/your-feature-name
    ```

6.  **Create a Pull Request:** Submit a pull request from your branch to the main branch of the original repository.

## License Information

No license specified. All rights reserved by the repository owner.

## Contact/Support Information

For questions or support, please contact [Suryakant Khevji](mailto:suryakantkhevji@gmail.com).