# HostelMart backend

Express + MongoDB API. This service uses Multer and Cloudinary for image/video uploads, so deploy it as a persistent Node web service (Render is configured by `render.yaml`) rather than a request-limited serverless function.

## Deploy with Render

1. Create a Render Blueprint from this repository and select `render.yaml`.
2. Set `MONGODB_URI` and the Cloudinary values in the Render service environment.
3. Set `FRONTEND_URL` to the exact Vercel production origin (no trailing slash). Comma-separated origins can be used for approved preview domains.
4. Deploy and confirm `https://<service>.onrender.com/api/health` returns JSON with `success: true`.
5. Set the Vercel frontend environment variable `VITE_API_URL` to `https://<service>.onrender.com/api` and redeploy the frontend.

Copy `.env.example` to `.env` for local development. Never commit `.env`; use the hosting provider’s secret environment settings in production.
