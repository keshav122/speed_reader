import React from 'react';
import { useDocument } from '../hooks/useDocumentStore';

export function TextPreview() {
  const { document } = useDocument();

  if (!document) {
    return null;
  }

  const preview = document.rawText.substring(0, 500);
  const isLonger = document.rawText.length > 500;

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        Document Preview
      </h2>

      <div className="grid gap-2 text-sm text-slate-600 mb-4 sm:grid-cols-2">
        <p>
          <strong>File:</strong> {document.fileName}
        </p>
        <p>
          <strong>Words:</strong> {document.totalWords.toLocaleString()}
        </p>
        <p>
          <strong>Pages:</strong> {document.pageCount.toLocaleString()}{' '}
          {document.hasEstimatedPages ? '(estimated)' : '(document)'}
        </p>
        {document.visualTokenCount > 0 && (
          <p>
            <strong>Visual pauses:</strong> {document.visualTokenCount}
          </p>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-slate-200">
        <p className="text-sm text-slate-700 leading-relaxed">
          {preview}
          {isLonger && '...'}
        </p>
      </div>

      <div className="text-xs text-slate-500 mt-3">
        Showing first 500 characters of {document.rawText.length} total
      </div>
    </div>
  );
}

