import React from 'react';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  selectedFile: File | null;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onUpload, selectedFile }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Resume (PDF)
      </label>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {selectedFile && (
        <p className="mt-2 text-sm text-gray-500">
          Selected file: {selectedFile.name}
        </p>
      )}
    </div>
  );
}; 