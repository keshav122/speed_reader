import React from 'react';
import './styles/globals.css';
import { FileUpload } from './components/FileUpload';
import { TextPreview } from './components/TextPreview';
import { RSVPPlayer } from './components/RSVPPlayer';
import { useDocument } from './hooks/useDocumentStore';

function App() {
  const { document } = useDocument();

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Rapid Serial Visual Presentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
            RSVP Speed Reader
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Upload text, PDF, or DOCX and read one token at a time with focal-letter
            alignment, adjustable pace, and page-aware jumps.
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Privacy-first: all parsing runs in your browser memory only. Files are not uploaded
            to a server.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {document ? 'Document Loaded' : 'Upload Your Document'}
          </h2>
          <FileUpload />
        </section>

        {document && (
          <section>
            <TextPreview />
            <RSVPPlayer />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
