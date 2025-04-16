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

    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      cpp: 54,
      java: 62,
    };

    const languageId = languageMap[selectedLanguage.id];
    if (!languageId) {
      setOutput('Error: Unsupported language for execution.');
      setIsRunning(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;
      if (!apiKey) {
        throw new Error('API key is not defined in environment variables.');
      }

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
      let result;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      } while (result.status.id <= 2);
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
    <div className={`p-6 min-h-screen ${theme === 'vs-dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-opacity-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-200 dark:border-blue-800">
          <h1 className={`text-2xl font-bold ${theme === 'vs-dark' ? 'text-white' : 'text-gray-800'}`}>
            <span className="text-blue-500">EV</span>iator IDE
          </h1>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedLanguage.id}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'vs-dark' 
                  ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' 
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
              } border shadow-sm`}
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                theme === 'vs-dark'
                  ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              } border shadow-sm`}
            >
              {theme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-sm ${
                isRunning
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.03] active:scale-[0.97]'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Code
                </span>
              )}
            </button>
          </div>
        </div>

        <div className={`mb-6 rounded-xl overflow-hidden shadow-lg ${theme === 'vs-dark' ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'}`}>
          <div className={`px-4 py-2 text-sm font-medium ${theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} border-b ${theme === 'vs-dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {selectedLanguage.name} Code Editor
          </div>
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
              padding: { top: 16, bottom: 16 },
              folding: true,
              renderLineHighlight: 'all',
              suggestOnTriggerCharacters: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'vs-dark' ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'}`}>
            <div className={`px-4 py-2 text-sm font-medium ${theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} border-b ${theme === 'vs-dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter custom input for your program here..."
              className={`w-full h-40 p-4 focus:outline-none ${
                theme === 'vs-dark' 
                  ? 'bg-gray-800 text-gray-200 placeholder-gray-500' 
                  : 'bg-white text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>
          <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'vs-dark' ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'}`}>
            <div className={`px-4 py-2 text-sm font-medium ${theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} border-b ${theme === 'vs-dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              Output
            </div>
            <pre className={`w-full h-40 p-4 overflow-auto font-mono text-sm ${
              theme === 'vs-dark' 
                ? 'bg-gray-800 text-gray-200' 
                : 'bg-white text-gray-800'
            }`}>
              {output || "Output will appear here after running the code..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiLangIDE;