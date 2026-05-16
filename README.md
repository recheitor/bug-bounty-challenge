# Bug Bounty Challenge

## Getting started

```bash
npm install
npm start
```

Opens at `http://localhost:3000`. The app picks `en` as default and exposes a language switcher in the header (English / Deutsch).

## Commit structure

For each task there is a dedicated commit that does **strictly what the task asks for**. Together with the optional tasks I addeds some extra improvements that I think that add value.

### Task 1 — Missing `key` prop warning in `<List>`

**Root cause:** In [src/pages/Home/index.tsx](src/pages/Home/index.tsx) the `issues.map(...)` rendered `<ListItem>` without a `key`.

**Fix:** Added the title as stable `key` . Later when added the languages, refactored so each item now has a unique string `key` from the i18n translation key (more stable than the title, which would have changed between languages).

> Note: in this case the data is hard-coded, so a translation key is a perfectly stable identifier. In a real scenario where the list comes from an API, the right choice would be the entity's `id` from the backend — it's guaranteed unique and stable across renders, languages, and reorders, in a way that a title or translation key cannot guarantee.

---

### Task 2 — The word "known" must be **bold** in the intro text without changing the i18n text

**Symptom:** The i18n string contained `<b>known</b>` as literal characters, so it was rendered as plain text.

**Root cause:** `t("home.intro")` returns the raw string, so HTML tags inside are escaped.

**Fix:** Used the `<Trans>` component from `react-i18next` and mapped the `<b>` tag to a React `<b />` element. The translation file is untouched — the markup is interpreted at render time. See [src/pages/Home/index.tsx:27](src/pages/Home/index.tsx#L27).

```tsx
<Trans i18nKey="home.intro" t={t} components={{ b: <b /> }} />
```

---

### Task 3 — Avatar in the app bar is missing

**Symptom:** The user is fetched on app start but the avatar never appears.

**Root cause:** Two stacked bugs.

1. In [src/api/services/User/store.ts](src/api/services/User/store.ts) the MobX action assigned the fetched user to a typo'd field: `this.urser = result;` instead of `this.user`. The observable `user` therefore stayed `undefined`, so `<AppHeader>` never rendered the avatar (the JSX is gated by `user && user.eMail`).
2. After fixing the typo, the warning *"Function components cannot be given refs"* appeared. `<Grow>` (a MUI transition) forwards a `ref` to its child, but `AvatarMenu` was a plain function component, so the ref was dropped.

**Fix:**
- Corrected the typo to `this.user = result;`.
- Wrapped `AvatarMenu` in `forwardRef<HTMLDivElement, AvatarMenuProps>` and forwarded the ref to the root `<Avatar>` element. Also replaced its wrapper `<div>` with a fragment so the ref attaches directly to the animated node, which is what `<Grow>` needs.
- Improvement: Did the same on `AppHeader` (`forwardRef<HTMLDivElement, AppHeaderProps>`) so the typing is consistent.

Files: [src/api/services/User/store.ts](src/api/services/User/store.ts), [src/components/AvatarMenu/index.tsx](src/components/AvatarMenu/index.tsx), [src/components/AppHeader/index.tsx](src/components/AppHeader/index.tsx).

---

### Task 4 (optional) — Countdown glitches sometimes

**Symptom:** The header countdown occasionally ticks faster than once per second, or two intervals seem to be running at once.

**Root cause:** [src/components/AppHeader/index.tsx](src/components/AppHeader/index.tsx) called `setInterval` inside `useEffect` but did not return a cleanup function. Under React 18 / StrictMode (and any time the component re-mounts, e.g. HMR or parent re-renders during dev), the effect runs multiple times and leaks intervals — so multiple timers update the same state, making the countdown run too fast.

**Fix:**

```tsx
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

The cleanup ensures only one interval is active at a time, even across StrictMode double-invocations or remounts.

---

### Task 5 (optional) — Language switcher

Added a new component at [src/components/LanguageSelect/](src/components/LanguageSelect/) that renders a small MUI `<Select>` with flag + language name. Selecting an option calls `i18n.changeLanguage(...)`, which `react-i18next` propagates to every `t()` call and `<Trans>` element. The control is mounted in the right-hand area of [src/components/AppHeader/index.tsx](src/components/AppHeader/index.tsx) next to the avatar.

The German translation file [src/i18n/locales/de.json](src/i18n/locales/de.json) was empty, so I authored a full German translation matching the English structure (including the new keys introduced below).

---

## Additional bugs I found and fixed

### A. Unsafe optional chaining in `AvatarMenu`

In [src/components/AvatarMenu/index.tsx](src/components/AvatarMenu/index.tsx) the original code was:

```ts
const initials = [user.firstName, user.lastName]
  .map((_) => (_[0] ? _[0].toLocaleUpperCase() : _))
  .join("");
```

If either `firstName` or `lastName` is `undefined`, `_[0]` throws *"Cannot read properties of undefined"*. Same problem in `stringAvatar` with `user?.firstName[1]` — the optional chain stops at `firstName`, but `[1]` is then read unconditionally.

Fixed to `_?.[0]` and `user.firstName?.[1]`, and falling back to an empty string instead of returning the original `undefined` (which would later be joined as the literal string `"undefined"`).

### B. Hard-coded English strings in `AvatarMenu`

"Edit Profile", "Edit Organization", "Data Privacy Statement", "Imprint" were hard-coded. Moved them into the `avatarMenu.*` namespace in both locale files and consumed them through `t()`. This is what surfaced the need to expand `de.json`.

### C. Service registry was a dead `require.context` hack

[src/api/services/index.tsx](src/api/services/index.tsx) (before) had a commented-out `require.context` "auto-discovery" and was actually exporting `[User]` — but `User` is a component module, not a `StoreProvider`. `App.tsx` was bypassing this file entirely and importing `UserStoreProvider` directly. So the file was misleading and unused.

Rewrote it as a small, explicit registry with a `StoreProviders` component that composes every provider via `reduceRight`, so adding a new store is one line. `App.tsx` now uses `StoreProviders` instead of inlining its own combinator (`CombinedStoreProvider` was removed).

### D. `Suspense` fallback was a hard-coded English `"loading..."`

Wrapped it in a small `<Loading>` component that uses `t("loading")`, so the splash text is also translated.

### E. Debug `console.log(user)` left in `Root`

Removed `console.log(user)` and the now-unused import in [src/pages/Root/index.tsx](src/pages/Root/index.tsx).

### F. Wrong typing on `React.forwardRef` in `AppHeader`

The original `React.forwardRef((props: AppHeaderProps, ref) => ...)` did not pass a generic, so `ref` was typed as `unknown`. Switched to `React.forwardRef<HTMLDivElement, AppHeaderProps>`.

### G. `react-scripts` 4 → 5

The lockfile-free `react-scripts@4.0.3` no longer builds cleanly on modern Node (and is incompatible with several MUI 5 transitive deps). Bumped to `^5.0.1` and committed `package-lock.json` so installs are reproducible.

### H. Missing TS config for CRA

`tsconfig.json` was missing several options CRA expects (`target`, `module`, `moduleResolution`, `isolatedModules`, `resolveJsonModule`, `noEmit`, …). Added them and the matching `react-app-env.d.ts`. Also added `@types/react-router-dom` so the routing imports are properly typed.

### I. Tightened i18n strings

Added an `AccessDenied` / `speakToYourAdmin` pair (the `AccessDenied` page was referenced but the keys were missing) so the access-denied route is rendered correctly in both languages.

---

## Improvements

- **`Home` page refactor.** The issue list used to be a literal array of strings inside the component. Extracted to a top-level `ISSUES` constant where each item is `{ icon, key }`, and the title/description come from i18n (`home.issues.<key>.title` / `.description`). This means the issue list is fully translated, and React doesn't rebuild the array on every render.
- **Consistent `key` strategy on lists.** Using the translation key as the React `key` makes it stable across languages.
- **`StoreProviders` registry.** Adding a new store is now one line in [src/api/services/index.tsx](src/api/services/index.tsx). The file has a comment explaining ordering semantics (outer-to-inner) so the next person doesn't have to reverse-engineer it.
- **Strict TypeScript.** `strict: true` was already on, but the project didn't compile under it; with the typing fixes above it now does.
- **Avatar loading placeholder.** The user is fetched asynchronously on app start, so the avatar slot in the header used to be empty for ~1 second and then pop in. Replaced the empty slot with a 40×40 `Box` (matching the MUI `<Avatar>` default size) containing a `CircularProgress size={24}` while `user.eMail` is undefined. No layout shift when the avatar swaps in, and the user gets immediate feedback that something is loading. See [src/components/AppHeader/index.tsx](src/components/AppHeader/index.tsx). I deliberately preferred this localized spinner over wiring the existing full-screen `loadingApp` branch in `Root` — this is effectively a public homepage, so the rest of the UI can render immediately and only the avatar slot waits on the user fetch, rather than blocking the whole page behind a big splash spinner.
- **Co-located `AppHeader` styles.** Moved inline `sx` objects and the `styled(MuiAppBar)` into [src/components/AppHeader/styles.ts](src/components/AppHeader/styles.ts), matching the pattern in [src/components/LanguageSelect/styles.ts](src/components/LanguageSelect/styles.ts).


---

## What I would do next in a real production environment

### Testing - Cover all cases. Similar to what I already did in the backend challenge
- **Unit tests** for `getInitials` / `stringAvatar` (pure functions, lots of edge cases around missing names).
- **Component tests** with React Testing Library for `AvatarMenu`, `AppHeader`, `LanguageSelect`, and the `Home` issue list (cover the i18n + `<Trans>` rendering, and the countdown cleanup).
- **A regression test for the interval leak** — render `AppHeader`, advance fake timers, unmount, and assert no further `setCount` calls. This is the kind of bug that quietly comes back.
- **Store tests** for `UserStore.fetchUser` (success / failure / typo regression).
- **End-to-end** smoke test (Something I worked with would be Playwright or Cypress) for example: app loads → avatar appears → menu opens → logout → console.log.

### Tooling and CI
- **ESLint + Prettier** wired into pre-commit (Husky + lint-staged) and into CI. The repo currently relies on `react-app` ESLint config only.
- **GitHub Actions** running `tsc --noEmit`, `eslint`, `npm test`, and `npm run build` on every PR.
- **Dependabot / Renovate** for dependency hygiene. Pinning React 17 + `react-scripts` 5 long-term is a known dead-end; CRA is no longer maintained.

### Architecture
- **API layer.** Right now the user is fabricated in-store. In production this becomes a typed client (e.g. `openapi-typescript` generated from the backend spec, or tRPC if the backend is in the same monorepo), with proper error states and retries.
- **State.** MobX is fine, but I'd separate domain stores from UI stores and consider React Query for server state — MobX for UI state, React Query for cache/sync.

### Observability and quality
- **Error boundary** at the root + Sentry (or similar) for client-side errors. Right now an exception in any leaf bubbles up to a blank screen.
- **Web vitals** (LCP, INP, CLS) reported to whatever analytics backend is in use.

### Build, deploy, security
- **Source maps** uploaded to error tracker, but not served publicly.
- **CSP / strict transport security headers** at the edge.
- **Bundle analysis** (`source-map-explorer` or `vite-bundle-visualizer`) in CI with a size budget — MUI is heavy and grows quickly.
- **Feature flags** for risky changes (LaunchDarkly / GrowthBook / a homegrown table).