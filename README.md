# RSVP Speed Reader

Browser-based RSVP reader for TXT, PDF, and DOCX files.

## Privacy Model

- Files are processed fully in the browser.
- No backend is used for parsing or storage.
- Uploaded documents stay in device memory for the current session.

## Language Support

- Works best for any language with clear extractable text.
- Supports Unicode token handling and focal-point rendering for non-English scripts.
- For scripts with limited whitespace (for example CJK), tokenization uses `Intl.Segmenter` when available.

## Run Locally

```bash
npm install
npm run dev
```

## Free Hosting (Vercel)

This app is static (`dist/`) and can be hosted on Vercel free tier.

1. Push this project to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

`vercel.json` is included with these settings.
