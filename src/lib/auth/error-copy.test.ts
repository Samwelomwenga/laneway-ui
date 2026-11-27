import { describe, expect, it } from "vitest"
import {
  accountFreeCopy,
  copyForError,
  formatRetryAfter,
  lastAdminCopy,
  signInBlockHint,
  tooManyIncorrectPasswordsCopy,
  tooManyRequestsCopy,
} from "@/lib/auth/error-copy"

describe("copyForError", () => {
  it.each([
    ["invalidCredentials", "Those credentials are incorrect. Give it another go."],
    ["wrongPassword", "Incorrect password."],
    ["tooShort", "Use at least 8 characters."],
    ["tooLong", "Use 128 characters or fewer."],
    ["commonPassword", "Use a stronger password. That one is so common it's easy to guess."],
    ["containsContextWord", "Use a stronger password. Leave out your username, the part of your email before the @, and the word laneway."],
    ["breachedPassword", "Use a stronger password. That one appears in data leaks from other sites, so attackers try it first."],
    ["sameAsCurrent", "Pick a password that's different from your current one."],
  ])("maps %s", (code, copy) => {
    expect(copyForError({ code, field: "password" })).toBe(copy)
  })

  it("maps duplicate on newEmail", () => {
    expect(copyForError({ code: "duplicate", field: "newEmail" })).toBe("Another user already signs in with that email.")
  })

  it.each([
    [
      "an unknown code",
      { code: "somethingNew", field: null },
    ],
    [
      "duplicate on another field",
      { code: "duplicate", field: "username" },
    ],
    [
      "a code shaped like an object key",
      { code: "toString", field: null },
    ],
  ])("falls back for %s", (_, error) => {
    expect(copyForError(error)).toBe("Something went wrong. Try again.")
  })
})

describe("signInBlockHint", () => {
  it("links the reset to forgot password", () => {
    expect(signInBlockHint).toEqual({
      text: "After 5 incorrect tries, we pause sign-in for up to 15 minutes. Stuck?",
      link: { text: "Reset your password.", href: "/forgot-password" },
    })
  })
})

describe("lastAdminCopy", () => {
  it("names one place", () => {
    expect(lastAdminCopy(["Design"])).toBe("You're the only admin of Design. Make someone else an admin there first.")
  })

  it("names two places", () => {
    expect(lastAdminCopy(["Design", "Ops"])).toBe("You're the only admin of Design and Ops. Make someone else an admin there first.")
  })
})

describe("formatRetryAfter", () => {
  it.each([
    [1, "1 second"],
    [10, "10 seconds"],
    [60, "a minute"],
    [61, "2 minutes"],
    [600, "10 minutes"],
  ])("formats %i s as %s", (seconds, words) => {
    expect(formatRetryAfter(seconds)).toBe(words)
  })
})

describe("429 copy", () => {
  it("tells a sign-in, sign-up, or email form when to retry", () => {
    expect(tooManyRequestsCopy(600)).toBe("Try again in about 10 minutes.")
  })

  it("blames incorrect passwords on a password-checked settings form", () => {
    expect(tooManyIncorrectPasswordsCopy(60)).toBe("Too many incorrect passwords. Try again in about a minute.")
  })
})

describe("accountFreeCopy", () => {
  it("never calls the user an account", () => {
    expect(accountFreeCopy).toMatchObject({
      signUp: "Sign up",
      usernameCheckUnavailable: "Couldn't check that name right now. We'll check it when you sign up.",
      alreadySignedUp: { text: "Already signed up with this email?", link: "Sign in" },
    })
  })

  it("confirms a reset link without saying whether the email signed up", () => {
    expect(accountFreeCopy.resetLinkSent("sam@laneway.test")).toBe("If someone signed up with sam@laneway.test, we sent it a link to reset the password.")
  })
})
