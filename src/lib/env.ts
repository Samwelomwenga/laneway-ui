// Literal member reads only. Next inlines `process.env.NODE_ENV` by find and replace, so a dynamic
// `process.env[name]` lookup reads undefined in a client bundle.
const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  LANEWAY_API_URL: process.env.LANEWAY_API_URL,
} as const

type EnvVar = keyof typeof ENV

export function requireEnv(name: EnvVar): string {
  const value = ENV[name]?.trim()
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var ${name}.`)
  }
  return value
}
