# Skill Exchange — MongoDB Edition

This edition removes Firebase entirely. MongoDB is the only database, and uploaded documents/profile images are stored in MongoDB GridFS.

## Requirements
- Node.js 20 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Setup (Windows PowerShell)
1. Extract this ZIP.
2. Open PowerShell in the folder containing `package.json`.
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Copy `.env.example` to `.env` and set `MONGODB_URI`, `MONGODB_DB`, and a long random `JWT_SECRET`.
   ```powershell
   Copy-Item .env.example .env
   ```
5. Ensure MongoDB is running. The default URI is `mongodb://127.0.0.1:27017`.
6. Start the app in development mode:
   ```powershell
   npm run dev
   ```
   Open http://localhost:3000. Vite forwards `/api` requests to the Express/MongoDB API middleware.

## Production
Build the frontend and start the Express server:
```powershell
npm run build
npm start
```
Open http://localhost:3000.

## MongoDB collections
- `users` — accounts and student profiles (passwords are bcrypt hashes)
- `subjects` — academic curriculum
- `resources` — resource metadata
- `uploads.files` / `uploads.chunks` — PDFs, office documents, images and avatars via GridFS
- `bookmarks`, `reviews`, `votes`, `activities`, `reports`

## Upload behavior
- Resource uploads are limited to 25 MB and allow PDF, DOC/DOCX, PPT/PPTX, TXT and common image formats.
- Files are streamed to MongoDB GridFS and served from `/api/files/:id` with the stored MIME type and inline disposition, so PDFs can open in-browser and other formats can be downloaded.
- Avatar uploads are limited to 5 MB and image MIME types.

## Password reset email
Configure SMTP variables in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) to send password reset emails. Without SMTP, the API returns a clear configuration error rather than pretending an email was sent.

## Google sign-in (optional, no Firebase)
Google OAuth is supported directly through Google Identity Services OAuth endpoints and MongoDB account records. To enable it, create a **Web application OAuth client** in Google Cloud Console and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env`. Add the same redirect URI to the OAuth client’s authorized redirect URIs. Keep `VITE_GOOGLE_AUTH_ENABLED=true` to show the Google buttons. The default redirect URI is `http://localhost:3000/api/auth/google/callback`. Email/password login works without Google credentials.

## Security notes
- Set a strong, unique `JWT_SECRET` before using this outside localhost.
- Use HTTPS and a managed MongoDB deployment with authentication and network restrictions in production.
- Never commit `.env` or database credentials.
