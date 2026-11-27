import { callApi } from "@/lib/api/client"

export async function GET(request: Request): Promise<Response> {
  const reply = await callApi("/api/v1/auth/sessions", { incoming: request.headers })
  return reply.body === null
    ? new Response(null, { status: reply.status })
    : Response.json(reply.body, { status: reply.status })
}
