// API base URL.
// - In development (Vite dev server on :5173), we point at the local Express
//   server on :5001. Configure via VITE_API_BASE in .env if needed.
// - In production (Vercel), the React app is served from the same origin as
//   the /api serverless functions, so we use a relative URL '/api'.
//
// Vite injects import.meta.env.* at build time. If the env var isn't set,
// fall back to '/api' (Vercel production default).

const API_BASE =
    (typeof import.meta !== 'undefined' &&
     import.meta.env &&
     import.meta.env.VITE_API_BASE) ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

export default API_BASE;
