# Commit conventions

Every commit follows [Conventional Commits](https://www.conventionalcommits.org/). The husky `commit-msg` hook runs commitlint with `@commitlint/config-conventional`, so a message that breaks these rules never lands. `commitlint.config.ts` holds the type list.

## Format

```
<type>(<scope>)!: <subject>

<body>
```

- `type` is one of the 11 types below. Required, lowercase.
- `scope` is optional and free-form, lowercase. Name the area the change touches, such as `board`, `auth`, or `deps`. Leave it out for repo-wide changes.
- `!` after the type or scope marks a breaking change. A `BREAKING CHANGE:` footer works too.
- `subject` is imperative and lowercase, with no trailing period. Write "add", not "Added" or "Adds".
- The header is at most 100 characters.
- The body is optional. Use it to explain why. Wrap its lines at 100 characters or fewer, which commitlint also enforces.

## Allowed types

These match laneway-api.

| Type       | Use for                                                   |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new user-facing capability or behaviour                 |
| `fix`      | A bug fix                                                 |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf`     | A change that makes something faster                      |
| `test`     | Adding or correcting tests                                |
| `docs`     | Documentation only                                        |
| `build`    | Build config, dependencies, or tooling                    |
| `ci`       | CI configuration                                          |
| `chore`    | Housekeeping that fits no other type                      |
| `style`    | Formatting only, with no change in meaning                |
| `revert`   | Reverting an earlier commit                               |

## Examples

```
feat(board): add drag to reorder lists
```

```
fix(auth): refresh the token before it expires
```

```
build(deps)!: drop support for node 24
```

## Do not

- Add a `Co-Authored-By` trailer for an AI tool or any other AI attribution line.
- Use past tense or a capitalised subject.
- Put a ticket id in place of the type, as in `#12: add thing`.
