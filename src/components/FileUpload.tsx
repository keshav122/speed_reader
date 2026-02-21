import React, { useCallback } from 'react';
import { useDocument } from '../hooks/useDocumentStore';

export function FileUpload() {
  const { loadDocument, loading, error } = useDocument();
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFile(files[0]);
      }
    },
    []
  );

  const handleFile = async (file: File) => {
    try {
      await loadDocument(file);
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragActive
            ? 'border-cyan-500 bg-cyan-50/80 shadow-lg'
            : 'border-slate-300 bg-white/75 hover:border-cyan-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept=".txt,.pdf,.docx,.doc"
          onChange={handleChange}
          disabled={loading}
        />

        <label htmlFor="file-input" className="cursor-pointer block">
          <div className="mb-4">
            <svg
              className="mx-auto h-14 w-14 text-cyan-700"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-8 8m0 0l-8-8m8 8v32"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-xl font-semibold text-slate-900">
            Drag and drop your file here
          </p>
          <p className="text-sm text-slate-600 mt-2">
            or click to select a file
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supported formats: TXT, PDF, DOCX (DOC not supported) - max 100MB
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Files stay local in your browser memory and are never uploaded.
          </p>
        </label>

        {loading && (
          <div className="mt-4">
            <p className="text-sm text-cyan-700">Loading file...</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-600 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
}
