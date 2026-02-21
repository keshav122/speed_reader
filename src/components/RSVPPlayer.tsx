import React from 'react';
import { useDocument, usePlayback } from '../hooks/useDocumentStore';
import { getTokenDisplayDelayMs, splitWordForDisplay } from '../utils/rsvp';

function formatRemainingTime(remainingWords: number, wordsPerMinute: number): string {
  if (remainingWords <= 0) return '0:00';

  const totalSeconds = Math.ceil((remainingWords / wordsPerMinute) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function RSVPPlayer() {
  const { document } = useDocument();
  const {
    isPlaying,
    currentWordIndex,
    wordsPerMinute,
    fontSizePercent,
    visualPauseMs,
    setPlaying,
    setCurrentWordIndex,
    setWordsPerMinute,
    setFontSize,
    setVisualPauseMs,
    resetPlayback,
  } = usePlayback();
  const [pageInput, setPageInput] = React.useState('1');

  React.useEffect(() => {
    setPageInput('1');
  }, [document?.id]);

  React.useEffect(() => {
    if (!document || !isPlaying) return;

    if (currentWordIndex >= document.totalWords - 1) {
      setPlaying(false);
      return;
    }

    const currentToken = document.wordArray[currentWordIndex];
    if (!currentToken) return;

    const delay = getTokenDisplayDelayMs(currentToken, wordsPerMinute, visualPauseMs);
    const timeout = window.setTimeout(() => {
      setCurrentWordIndex(currentWordIndex + 1);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [
    document,
    isPlaying,
    currentWordIndex,
    wordsPerMinute,
    visualPauseMs,
    setCurrentWordIndex,
    setPlaying,
  ]);

  if (!document) {
    return null;
  }

  const totalWords = document.totalWords;
  const currentToken = document.wordArray[currentWordIndex];
  const currentWord = currentToken?.text ?? '';
  const splitWord = splitWordForDisplay(currentWord);
  const currentPage = currentToken?.pageNumber ?? 1;
  const remainingWords = Math.max(0, totalWords - currentWordIndex - 1);
  const progressPercent =
    totalWords <= 1 ? 100 : (currentWordIndex / (totalWords - 1)) * 100;

  const onTogglePlay = () => {
    if (currentWordIndex >= totalWords - 1) {
      setCurrentWordIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying(!isPlaying);
  };

  const onReset = () => {
    resetPlayback();
  };

  const onJumpToPage = () => {
    const parsedPage = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(parsedPage)) return;

    const clampedPage = Math.max(1, Math.min(parsedPage, document.pageCount));
    const targetIndex = document.pageStartIndexes[clampedPage - 1] ?? 0;

    setPlaying(false);
    setCurrentWordIndex(targetIndex);
    setPageInput(String(clampedPage));
  };

  const onBackWord = () => {
    setPlaying(false);
    setCurrentWordIndex(currentWordIndex - 1);
  };

  const onForwardWord = () => {
    setPlaying(false);
    setCurrentWordIndex(currentWordIndex + 1);
  };

  return (
    <div className="card mt-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-slate-900">RSVP Reader</h2>
        <div className="text-xs font-medium text-slate-500">
          {document.hasEstimatedPages ? 'Estimated pages' : 'Document pages'}: {document.pageCount}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">Start from page</span>
          <input
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
            type="number"
            min={1}
            max={document.pageCount}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
          />
          <button className="btn btn-secondary !py-1.5" onClick={onJumpToPage}>
            Jump
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Current page: <span className="font-semibold text-slate-900">{currentPage}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
        <div className="relative h-52 sm:h-56 flex items-center justify-center px-4">
          <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px bg-red-400/40" />
          {currentToken?.kind === 'visual' ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-4 text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Visual pause</div>
              <div className="mt-2 text-xl font-semibold text-white">Diagram or table section</div>
              <p className="mt-2 text-sm text-cyan-100/90">
                {currentToken.visualReason ??
                  'This page may contain visual material. Taking a longer pause before continuing.'}
              </p>
            </div>
          ) : (
            <div
              className="flex items-baseline justify-center text-white font-semibold tracking-wide"
              style={{
                fontFamily:
                  '"JetBrains Mono", "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace',
                fontSize: `${Math.round((56 * fontSizePercent) / 100)}px`,
                lineHeight: 1.1,
              }}
            >
              <span className="inline-block w-[12ch] text-right pr-[0.05em]">
                {splitWord.leading}
              </span>
              <span className="text-red-500 min-w-[0.7ch] text-center">
                {splitWord.focal || '\u00A0'}
              </span>
              <span className="inline-block w-[12ch] text-left pl-[0.05em]">
                {splitWord.trailing}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>
            Word {Math.min(currentWordIndex + 1, totalWords).toLocaleString()} of{' '}
            {totalWords.toLocaleString()}
          </span>
          <span>Remaining {formatRemainingTime(remainingWords, wordsPerMinute)}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn btn-secondary" onClick={onBackWord}>
          Prev
        </button>
        <button className="btn btn-primary" onClick={onTogglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="btn btn-secondary" onClick={onForwardWord}>
          Next
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <div className="text-sm font-medium text-gray-700">
            Speed: {wordsPerMinute} WPM
          </div>
          <input
            className="w-full mt-2"
            type="range"
            min={100}
            max={1000}
            step={10}
            value={wordsPerMinute}
            onChange={(event) => setWordsPerMinute(Number(event.target.value))}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-gray-700">
            Word size: {fontSizePercent}%
          </div>
          <input
            className="w-full mt-2"
            type="range"
            min={50}
            max={200}
            step={5}
            value={fontSizePercent}
            onChange={(event) => setFontSize(Number(event.target.value))}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-gray-700">
            Visual pause: {(visualPauseMs / 1000).toFixed(1)}s
          </div>
          <input
            className="w-full mt-2"
            type="range"
            min={800}
            max={6000}
            step={100}
            value={visualPauseMs}
            onChange={(event) => setVisualPauseMs(Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
