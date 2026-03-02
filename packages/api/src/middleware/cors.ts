import cors from 'cors';

// Only allow requests from the localhost Vite frontend
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Electron, curl, localhost dev)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:4010',
      'http://127.0.0.1:4010',
    ];
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: false,
});
