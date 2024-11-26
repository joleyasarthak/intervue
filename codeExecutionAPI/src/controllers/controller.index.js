import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });


async function getHomePage(req,res){
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

async function executeCode(req, res) {
    const { code, language } = req.body;

    // Map the language name to a Judge0 language ID
    const languageMap = {
        javascript: 63,
        python: 71,
        java: 62,
        cpp: 54
    };
    
    const languageId = languageMap[language];

    if (!languageId) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    try {
        // Prepare the request to Judge0 API
        const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPID_API_KEY_JUDGE0,  // Replace with your API key
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: "", // If there are user inputs, add them here
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Send the output back to the client
            res.json({ output: result.stdout || result.stderr || "Code executed successfully!" });
        } else {
            // Handle Judge0 error response
            res.status(response.status).json({ error: result.message || "Execution failed" });
        }
    } catch (error) {
        // Handle fetch or execution errors
        res.status(500).json({ error: "An error occurred during code execution" });
    }
}



export {getHomePage,executeCode}