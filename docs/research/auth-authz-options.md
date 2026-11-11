# Auth and authz in front of laneway-api

Question: how would Auth.js, Better Auth, or no auth library sit in front of laneway-api in a Next 16 app? And how does CASL mirror the API's hand-written authorization?

API paths below are relative to `~/projects/laneway-api` at commit `7d3f1cb`. Next docs are from `node_modules/next/dist/docs/` for `next@16.4.6`. Checked on 2026-11-11.

## Recommendation

Use no auth library. The browser calls laneway-api directly, holds the access token in memory, and lets the API's refresh cookie do the rest. Add CASL on the client as a hint layer only, and treat the API's 403 codes as the truth.

My reasons, in order of weight:

1. The API was built for a browser client on another origin. CORS allows credentials and the CSRF header, and sign-in returns the access token in the body. Every piece of the flow already exists. Sources: `Features/Auth/CorsOrigins.cs`, `Features/Auth/AuthDtos.cs` (`SignedInDto`).
2. Both libraries would put a second session in front of the API's session. That second session would have its own lifetime and its own revocation story. ADR 0004 audits the API's session against ASVS L2. Nothing would audit the copy.
3. Any server-side login call makes every user look like one IP to the API's per-IP rate limits. Sign-in allows 10 per minute per IP. Source: `Features/Auth/RateLimits.cs`.
4. Auth.js v5 is still beta and now only gets urgent fixes. Better Auth has no supported way to sign in against an external API. Details are below.

The cost is real. Server Components can't fetch user data from laneway-api, because the Next server never sees the refresh cookie. User data loads in Client Components through TanStack Query. Proxy can't do an auth check either. I think that trade is fine for a kanban board behind a login. There is no public content to render on the server for SEO.

## The API's real flow

- `POST /api/v1/auth/sign-in` takes email and password. It returns `SignedInDto` with `accessToken`, `accessTokenExpiresAt`, and `sessionExpiresAt`. Sources: `Features/Auth/AuthController.cs`, `Features/Auth/AuthDtos.cs`.
- The access token is an HS256 JWT of type `at+jwt`. It lives 15 minutes and carries only `sub` and `sid`. Sources: `Features/Auth/AccessTokens.cs`, `Features/Auth/JwtBearerSetup.cs`.
- The refresh token goes in a cookie named `__Host-Http-lnw_refresh`. The cookie is `Secure`, `HttpOnly`, `SameSite=Strict`, and `Path=/`. It has no `Domain`, so it belongs to the API host only. Source: `Features/Auth/RefreshCookie.cs`.
- `POST /api/v1/auth/refresh` reads that cookie and rotates it. A retired token presented again after a 10 second grace window ends the whole session as `TokenReused`. Sources: `Features/Auth/AuthController.cs`, `Features/Auth/RefreshToken.cs` (`GraceWindow`), `Features/Auth/AuthService.cs` around line 982.
- Sign-up, verify-email, sign-in, and refresh carry `[CsrfChecked]`. The check wants header `X-Laneway-Csrf: 1`. It rejects an `Origin` outside the CORS list and rejects `Sec-Fetch-Site: cross-site`. Source: `Features/Auth/CsrfCheck.cs`.
- CORS allows exact origins only. It allows `Authorization`, `Content-Type`, and `X-Laneway-Csrf`, and sets `AllowCredentials`. Source: `Features/Auth/CorsOrigins.cs`.
- Production runs the UI on `https://laneway-app.samwelomwenga.com` and the API on `https://laneway-api.samwelomwenga.com`. Source: `appsettings.Production.json`. Those two hosts are the same site and different origins. So a `SameSite=Strict` cookie still rides along on a credentialed `fetch` from the app to the API, and `Sec-Fetch-Site` reads `same-site`, which passes the CSRF check.
- A session idles out after 7 days and ends after 30. Source: `Features/Auth/Session.cs`.
- The API records the session's user agent from the request. Source: `Features/Auth/AuthController.cs` (`Request.Headers.UserAgent`).
- Rate limits count by IP for sign-in (10 per minute), sign-up (10 per hour), and refresh (60 per minute). The API reads the client IP from the socket. It trusts `X-Forwarded-For` only from configured `KnownProxies` or `KnownNetworks`, with `ForwardLimit = 1`. Sources: `Features/Auth/RateLimits.cs`, `Shared/ClientIp.cs`, `Shared/HttpHardening.cs`.

## What Next 16 changes

- `middleware.ts` is deprecated and renamed `proxy.ts`. Proxy runs on the Node.js runtime by default, and setting `runtime` there throws. Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- Next tells you to do only optimistic, cookie-only checks in Proxy, because it runs on every route, prefetches included. Real checks belong in a Data Access Layer near the data. Source: `node_modules/next/dist/docs/01-app/02-guides/authentication.md`, sections "Optimistic checks with Proxy" and "Creating a Data Access Layer".
- Server Components can read cookies but can't set them. Only Server Functions and Route Handlers can set cookies. Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`, "Understanding Cookie Behavior in Server Components".

That last rule matters for this API. Its refresh token rotates on every use. A Server Component that refreshes on the server can't write the new token back, so the browser keeps the old one. The next refresh then presents a retired token, and after 10 seconds that ends the session.

## Option (a): Auth.js / NextAuth v5 with Credentials

### Token and cookie flow

1. A Server Action calls `signIn("credentials", ...)`. Auth.js runs `authorize()` on the Next server. Source: https://authjs.dev/getting-started/authentication/credentials
2. `authorize()` calls `POST /api/v1/auth/sign-in` server to server, with `X-Laneway-Csrf: 1`. No `Origin` header goes out, so the CSRF check passes. Source: `Features/Auth/CsrfCheck.cs`.
3. The access token arrives in the body. The refresh token arrives in a `Set-Cookie` header meant for the API host. `authorize()` has to parse that header by hand to keep it.
4. Auth.js stores both tokens inside its own session cookie, `authjs.session-token`. That cookie is an encrypted JWE (A256CBC-HS512) with a default 30 day idle lifetime. Sources: `@auth/core@0.41.3` files `lib/utils/cookie.js`, `jwt.js`, and `lib/init.js`.
5. The `jwt` callback refreshes when the access token expires. It calls `/auth/refresh` with the stored refresh token as a `Cookie` header and saves the rotated one. Source: https://authjs.dev/guides/refresh-token-rotation

Credentials only works with the JWT strategy. `@auth/core` throws "Signing in with credentials only supported if JWT strategy is enabled" otherwise. Source: `@auth/core@0.41.3` `lib/utils/assert.js` line 118.

### What it duplicates

- A second session cookie with its own lifetime (30 day idle) next to the API's session (7 day idle, 30 day absolute).
- Refresh logic and rotation bookkeeping. Auth.js's own guide warns that concurrent refreshes race on single-use refresh tokens, and offers no lock. Source: https://authjs.dev/guides/refresh-token-rotation
- Sign-out has to clear both sessions. Session revocation from the API's session list only shows up in Auth.js on the next refresh.

### Server Components and proxy

- `await auth()` works in Server Components, and `export { auth as proxy } from "@/auth"` works in `proxy.ts`. Source: https://authjs.dev/getting-started/session-management/protecting
- This is the one option where Server Components can fetch user data from laneway-api, because the Next server holds the access token.
- A refresh during a Server Component render can't write the rotated cookie, per the Next cookie rule above. The refresh has to happen in Proxy, a Route Handler, or a Server Function. Otherwise sessions end as `TokenReused`.
- The API sees the Next server's IP on sign-in and refresh. All users share one sign-in bucket of 10 per minute unless the API adds the Next server to `ForwardedHeaders:KnownProxies` and the UI forwards `X-Forwarded-For`. The UI also has to forward `User-Agent`, or every session in the session list shows Node's agent. Sources: `Features/Auth/RateLimits.cs`, `Shared/HttpHardening.cs`, `Features/Auth/AuthController.cs`.

### Maintenance

- `next-auth@5` has never shipped stable. The `beta` tag is `5.0.0-beta.32`, published 2026-07-20. `latest` is still `4.24.15`. Source: https://registry.npmjs.org/next-auth
- Its peer range covers `next ^16.0.0` and `react ^19.0.0`. Source: https://registry.npmjs.org/next-auth/5.0.0-beta.32
- On 2025-09-22 Auth.js moved under the Better Auth team. They promise fixes for "urgent issues" and tell new projects to start with Better Auth. Source: https://www.better-auth.com/blog/authjs-joins-better-auth

### Agent skills

There is no first-party skill. The `nextauthjs/next-auth` repo has no `SKILL.md`. Source: `gh api repos/nextauthjs/next-auth/git/trees/main?recursive=1`. skills.sh lists only third-party ones, such as `mindrally/skills/nextauth-authentication`. Source: https://skills.sh/api/search?q=next-auth

## Option (b): Better Auth

### Token and cookie flow

Better Auth wants to own users and sessions. It stores sessions in a `session` table, and the session token is the cookie. It can add a signed `session_data` cookie cache. With no database configured it runs in stateless mode, with the session in a signed or encrypted cookie. Default expiry is 7 days. Source: https://www.better-auth.com/docs/concepts/session-management

It has no first-party way to check a password against an external API. When asked for an equivalent of Auth.js's `authorize()`, a contributor suggested making the backend OAuth-compatible for the Generic OAuth plugin, or writing a custom DB adapter. The issue closed without an official answer. Source: https://github.com/better-auth/better-auth/issues/7465

So it can sit in front of laneway-api in one of three ways:

1. Better Auth owns users and passwords, and laneway-api trusts Better Auth's JWTs through the JWT plugin's JWKS endpoint. Source: https://www.better-auth.com/docs/plugins/jwt. This moves auth out of the API. It throws away `Features/Auth/` and the ASVS L2 work in ADR 0004. It also breaks the API's HS256-only, `at+jwt`-only validation in `Features/Auth/JwtBearerSetup.cs`.
2. laneway-api becomes an OAuth or OIDC provider and Better Auth uses Generic OAuth. That is a large API change for one client.
3. A community plugin such as `erickweil/better-auth-credentials-plugin` calls the external login from a callback. Source: https://github.com/erickweil/better-auth-credentials-plugin. Its README says it isn't meant to re-implement password login. It is third party and tracks Better Auth's internals.

### What it duplicates

In way 1, everything: users, password hashing, sessions, email verification, reset. In ways 2 and 3 it duplicates the session, the same way Auth.js does. It has the same refresh-token problems, the same shared-IP rate limits, and the same user-agent problem.

### Server Components and proxy

- Mount `toNextJsHandler(auth)` at `/api/auth/[...all]`. Add the `nextCookies` plugin so Server Actions can set cookies. Source: https://www.better-auth.com/docs/integrations/next
- `auth.api.getSession({ headers: await headers() })` works in Server Components. The cookie cache refreshes only through a Server Action or Route Handler. Source: same page.
- In `proxy.ts`, Next 16 can call `auth.api.getSession` on the Node runtime. `getSessionCookie` is the fast option, and the docs say it "does not validate" the cookie. Source: same page.

### Maintenance

Active. `latest` is `1.7.21`, published 2026-11-11. Its peer range covers `next ^16.0.0` and `react ^19.0.0`. Source: https://registry.npmjs.org/better-auth

### Agent skills

`better-auth/skills` is first party and has six skills: `better-auth/best-practices`, `better-auth/create-auth`, `better-auth/emailAndPassword`, `better-auth/organization`, `better-auth/twoFactor`, and `security`. Source: `gh api repos/better-auth/skills/git/trees/HEAD?recursive=1`. ChalkApp-UI pins all six in `~/projects/chalkApp/ChalkApp-UI/skills-lock.json`. That makes sense there, because ChalkApp-UI uses `better-auth@^1.6.9` as its auth owner. Here they would teach a setup we wouldn't build.

## Option (c): no auth library, the UI calls laneway-api

### Token and cookie flow

1. A Client Component posts sign-in to `https://laneway-api.../api/v1/auth/sign-in` with `credentials: "include"` and `X-Laneway-Csrf: 1`. The browser stores the refresh cookie on the API host. The UI keeps the access token in memory. Sources: `Features/Auth/CsrfCheck.cs`, `Features/Auth/RefreshCookie.cs`, `Features/Auth/CorsOrigins.cs`.
2. Every API call sends `Authorization: Bearer <token>`. CORS allows that header. Source: `Features/Auth/CorsOrigins.cs`.
3. On page load, and on a 401 or a near-expiry token, the client calls `/auth/refresh` with credentials and the CSRF header. It gets a new access token, and the browser stores the rotated cookie itself.
4. The client runs one refresh at a time and shares the result across callers. Two tabs racing inside 10 seconds pass the grace window. A stale token after that ends the session. Source: `Features/Auth/AuthService.cs` around line 982.

### What it duplicates

Nothing on the server. The UI writes a small client: an in-memory token, a single-flight refresh, a `fetch` wrapper, and a session context. Session listing, sign-out everywhere, and password changes are plain API calls. The API sees each browser's own IP and user agent, so rate limits and the session list work as designed.

### Server Components and proxy

- The Next server never receives `__Host-Http-lnw_refresh`, because the cookie belongs to the API host. Source: `Features/Auth/RefreshCookie.cs`. So Server Components and Proxy know nothing about the user.
- Server Components render the shell. Client Components fetch user data with TanStack Query.
- Proxy can't do a real auth check. If we want a redirect before paint, the client can set a non-sensitive hint cookie on the app host after sign-in. Proxy reads it for a redirect only. Next's guide allows exactly this kind of optimistic check. Source: `node_modules/next/dist/docs/01-app/02-guides/authentication.md`.
- One variant would bring the cookie to the Next server. A Next rewrite of `/api/:path*` to the API makes calls same-origin, and the cookie then lands on the app host. Source: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/rewrites.md`, "Rewriting to an external URL". I don't recommend it. Every API call then comes from the Next server's IP, which brings back the rate-limit problem unless the API trusts that proxy. A Server Component still couldn't rotate the cookie.

### Maintenance

No dependency. The only upkeep is our own client code and keeping it in step with `Features/Auth/`.

### Agent skills

No auth skill applies. The API's own code and ADR 0004 are the reference.

## CASL

### What the API exposes

The API exposes no permissions list and no "can I" endpoint. ADR 0007 keeps roles out of the JWT on purpose. They come from the database on every request. Source: `docs/adr/0007-hand-written-authorization-in-services.md`, "Consequences".

The rules live in `Features/Membership/Rules.cs` and `Features/Membership/Standing.cs`:

- Roles rank `None < Observer < Normal < Admin`.
- `BoardStanding.Of` takes the higher of the board role and a granted Admin. A workspace admin gets that grant on any board that isn't private.
- `BoardRules.Refusal` maps actions to minimum roles. `Edit` needs Normal. `Administer` and `GrantAdmin` need Admin. `AddMember` needs Normal or Admin, depending on the board's `AddingMembers` setting. `Comment` depends on `Commenting`. `SelfJoin` depends on the `SelfJoin` setting.
- Workspace actions are `CreateBoard`, `ListMembers`, and `Administer`.

The UI can rebuild most of a standing from data the API already returns:

- `GET /api/v1/boards/{id}/members` returns `BoardMemberDto` with `role`, `status`, and `isGuest`. Source: `Features/Membership/MemberDtos.cs`.
- `GET /api/v1/workspaces/{workspaceId}/members` returns `WorkspaceMemberDto` with `role`. Same source.
- `GET /api/v1/boards/{id}/settings` returns `commenting`, `addingMembers`, `selfJoin`, and `visibility`. Sources: `Features/Board/BoardsController.cs`, `Features/Board/BoardDtos.cs`.
- The access token's `sub` is the caller's user id. Source: `Features/Auth/AccessTokens.cs`.

The gaps: `BoardDto` and `WorkSpaceDto` carry no caller role. The UI has to fetch member lists to find itself, and has to re-derive the workspace-admin grant. Sources: `Features/Board/BoardDtos.cs`, `Features/WorkSpace/WorkSpaceDtos.cs`. Every denial carries a stable code, such as `requiresBoardAdmin`, `readOnlyRole`, `requiresBoardMember`, `commentingDisabled`, or `notAuthor`, plus a message for the user. Source: `Shared/ErrorCodes.cs`, `Features/Membership/Rules.cs`.

### How the UI mirrors it

- Build one `createMongoAbility` per board view from the standing above. Write it as a TypeScript port of `BoardRules.Refusal`, with one `can()` per action. CASL supports both `AbilityBuilder` and raw JSON rules. JSON fits apps "that receive permissions via network layer". Source: https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/define-rules/en.md
- Wrap the board tree in `AbilityProvider`. Use `<Can I="edit" a="Board">` to hide controls, and `useAbility()` for logic. Call `ability.update(rules)` when membership or settings change. Source: https://github.com/stalniy/casl/blob/main/packages/casl-react/README.md
- Keep it a hint. A removed member keeps a stale ability until the next fetch, the same staleness ADR 0007 rejected for JWT roles. The API's 403 code stays authoritative, and the UI shows its message.
- One cheap API change would remove the port: add a `permissions` or `myRole` field to the board and workspace reads. The UI could then feed CASL straight from the API instead of copying `Rules.cs`. That is a laneway-api decision, so I only flag it.

Versions: `@casl/ability@7.1.2` (2026-11-10) and `@casl/react@7.1.0` (2026-10-28). `@casl/react` peers on `react ^18 || ^19`. Source: https://registry.npmjs.org/@casl/ability, https://registry.npmjs.org/@casl/react

### Skills for CASL

There is no first-party skill. `stalniy/casl` ships no `SKILL.md`. Source: `gh api repos/stalniy/casl/git/trees/HEAD?recursive=1`. Third-party ones exist with almost no installs, such as `tuannguyen151/foxdemon-plugins/casl-authorization` with 2 installs. Most "CASL" hits on skills.sh are about Canada's anti-spam law. Sources: https://skills.sh/api/search?q=casl, `gh search code casl --filename SKILL.md`. I wouldn't vendor any of them.

## Effect on the skill set

Option (c) adds no auth skill and no CASL skill to vendor. If the map picks option (b) anyway, the six `better-auth/skills` entries in ChalkApp-UI's lock are the ones to copy.
