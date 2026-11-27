/** Compose's healthcheck. It never calls the API, so a down API doesn't restart the UI. */
export function GET(): Response {
  return new Response("ok")
}
