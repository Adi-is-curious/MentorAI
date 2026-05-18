import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// serverless-http wraps the Express app for AWS Lambda / Netlify Functions.
// The basePath tells it to strip /.netlify/functions/api from the URL
// so Express sees /resume/analyze instead of /.netlify/functions/api/resume/analyze.
//
// IMPORTANT: The redirects in netlify.toml send /api/* → /.netlify/functions/api/:splat
// So Express receives the path AFTER /api/ (e.g. /resume/analyze, /quiz/generate, etc.)
// The server/index.ts routes at lines 118-125 handle these stripped paths.

export const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
});
