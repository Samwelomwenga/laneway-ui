/** One entry in the `errors` list of a laneway-api reply. */
export type ApiError = {
  field: string | null
  code: string
  message: string
}

const FALLBACK = "Something went wrong. Try again."

const COPY_BY_CODE = new Map([
  ["invalidCredentials", "Those credentials are incorrect. Give it another go."],
  ["wrongPassword", "Incorrect password."],
  ["tooShort", "Use at least 8 characters."],
  ["tooLong", "Use 128 characters or fewer."],
  ["commonPassword", "Use a stronger password. That one is so common it's easy to guess."],
  ["containsContextWord", "Use a stronger password. Leave out your username, the part of your email before the @, and the word laneway."],
  ["breachedPassword", "Use a stronger password. That one appears in data leaks from other sites, so attackers try it first."],
  ["sameAsCurrent", "Pick a password that's different from your current one."],
])

export function copyForError({ field, code }: Pick<ApiError, "field" | "code">): string {
  if (code === "duplicate") {
    return field === "newEmail"
      ? "Another user already signs in with that email."
      : FALLBACK
  }
  return COPY_BY_CODE.get(code) ?? FALLBACK
}

// Matches laneway-api's `SignInBlock`: a block every `FailuresPerStep` failures, capped at `LongestBlock`.
export const signInBlockHint = {
  text: "After 5 incorrect tries, we pause sign-in for up to 15 minutes. Stuck?",
  link: { text: "Reset your password.", href: "/forgot-password" },
} as const

const placeList = new Intl.ListFormat("en", { type: "conjunction" })

export function lastAdminCopy(places: readonly string[]): string {
  return `You're the only admin of ${placeList.format(places)}. Make someone else an admin there first.`
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return seconds === 1
      ? "1 second"
      : `${seconds} seconds`
  }
  const minutes = Math.ceil(seconds / 60)
  return minutes === 1
    ? "a minute"
    : `${minutes} minutes`
}

export function tooManyRequestsCopy(retryAfterSeconds: number): string {
  return `Try again in about ${formatRetryAfter(retryAfterSeconds)}.`
}

export function tooManyIncorrectPasswordsCopy(retryAfterSeconds: number): string {
  return `Too many incorrect passwords. ${tooManyRequestsCopy(retryAfterSeconds)}`
}

export const accountFreeCopy = {
  signUp: "Sign up",
  usernameCheckUnavailable: "Couldn't check that name right now. We'll check it when you sign up.",
  alreadySignedUp: { text: "Already signed up with this email?", link: "Sign in" },
  resetLinkSent: (email: string) => `If someone signed up with ${email}, we sent it a link to reset the password.`,
} as const
