# Travel

Next.js travel app with destination discovery, maps, trip planning, social posts,
private messaging, and an OpenRouter assistant. MongoDB stores account and social data.

## Setup

Install Node.js, run `npm ci`, create `.env.local`, then run `npm run dev`.
Open http://localhost:3000.

Required account environment variables:
- `MONGO_URI`: MongoDB connection URI.
- `JWT_SECRET`: long random signing secret.

Chatbot variables:
- `OPENROUTER_API_KEY`: server-side OpenRouter API key.
- `OPENROUTER_MODEL`: optional model identifier, default `openrouter/auto`.

Optional destination/image integration variables: `GEMINI_API_KEY`,
`UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, and `PIXABAY_API_KEY`.
Keep secrets in `.env.local`, which Git ignores.
Admin access requires `isAdmin: true` on the authenticated database user.

## Validation

Run `npm run typecheck`, `npm run test:security`, and `npm run build`.
Run `npm start` after building. Production cookies require HTTPS and expire
in seven days. Database diagnostic routes return 404.
