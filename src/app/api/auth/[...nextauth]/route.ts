import { handlers } from "@/auth";

// Delegate all /api/auth/* requests to Auth.js.
// This single route handles: sign-in, sign-out, OAuth callbacks, CSRF tokens.
export const { GET, POST } = handlers;
