export class DataReadError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Data read answered ${status}`)
    this.status = status
  }
}

export async function readData<T>(path: `/data/${string}`): Promise<T> {
  const response = await fetch(path, {
    redirect: "manual",
    headers: { accept: "application/json" },
  })
  // Proxy redirects a request with no refresh cookie to sign-in, which a fetch would follow to an HTML page.
  if (response.type === "opaqueredirect") {
    throw new DataReadError(401)
  }
  if (!response.ok) {
    throw new DataReadError(response.status)
  }
  const body = await response.json() as { data: T }
  return body.data
}
