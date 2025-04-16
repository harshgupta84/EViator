import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface Language {
  id: string;
  name: string;
  extension: string;
  defaultCode: string;
}

const languages: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    defaultCode: `// Write your JavaScript code here
function example() {
  console.log("Hello World!");
}
`,
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    defaultCode: `# Write your Python code here
def example():
    print("Hello World!")
`,
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    defaultCode: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
`,
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    defaultCode: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
`,
  },
];

function MultiLangIDE() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [code, setCode] = useState<string>(selectedLanguage.defaultCode);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleLanguageChange = (languageId: string) => {
    const language = languages.find((lang) => lang.id === languageId);
    if (language) {
      setSelectedLanguage(language);
      setCode(language.defaultCode);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');

    // Mapping of your language IDs to Judge0 language IDs (example values; verify with Judge0 docs)
    const languageMap: Record<string, number> = {
      javascript: 63, // Node.js in Judge0
      python: 71,     // Python 3 in Judge0
      cpp: 54,        // C++ in Judge0
      java: 62,       // Java in Judge0
    };

    const languageId = languageMap[selectedLanguage.id];
    if (!languageId) {
      setOutput('Error: Unsupported language for execution.');
      setIsRunning(false);
      return;
    }

    try {
      // Use environment variable for API key
      const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;
      if (!apiKey) {
        throw new Error('API key is not defined in environment variables.');
      }

      // Make direct request to Judge0 API via RapidAPI
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: code,
          language_id: languageId,
          stdin: input,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      const token = response.data.token;
      // Poll for result (Judge0 often requires polling for the result)
      let result;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const statusResponse = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
          }
        );
        result = statusResponse.data;
      } while (result.status.id <= 2); // Status ID <= 2 means still processing
      console.log(result);
      if (result.status.id === 3) {
        setOutput(result.stdout || 'No output');
      } else {
        setOutput(`Error: ${result.stderr || result.status.description}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute code.';
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <select
            value={selectedLanguage.id}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
          >
            {theme === 'vs-dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-4 py-2 ${isRunning ? 'bg-gray-400' : 'bg-green-500'} text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-sm`}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-lg bg-white mb-4">
        <Editor
          height="50vh"
          language={selectedLanguage.id}
          value={code}
          theme={theme}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
            folding: true,
            renderLineHighlight: 'all',
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter custom input for your program here..."
            className="w-full h-32 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Output</h3>
          <pre className="w-full h-32 p-2 border rounded-lg bg-gray-50 shadow-sm overflow-auto">
            {output || "Output will appear here after running the code..."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default MultiLangIDE;