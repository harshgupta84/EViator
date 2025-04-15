import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

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

  const handleLanguageChange = (languageId: string) => {
    const language = languages.find((lang) => lang.id === languageId);
    if (language) {
      setSelectedLanguage(language);
      setCode(language.defaultCode);
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
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
        <Editor
          height="75vh"
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
    </div>
  );
}

export default MultiLangIDE;