The Malta Veterans Association website uses Svelte 5 and SvelteKit 3. All 13 routes are prerendered into static HTML with `@sveltejs/adapter-static`, preserving the original folder URLs, content, styling, fonts, images, downloads, and video embeds.

Use Node.js 22.17 or newer (the `.nvmrc` selects Node 22):

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build, validate, and preview the exported website:

```sh
npm run check
npm run build
npm run verify
npm run preview
```

`build/` is generated and ignored by Git. Edit pages in `src/routes/`, shared Svelte components in `src/lib/components/`, page metadata and gallery records in `src/lib/data/`, and the original stylesheet and public assets in `static/assets/`. The original site is retained in `legacy/` for reference.

The responsive navigation, bilingual announcements, and 19 event galleries use Svelte 5 state. Gallery controls preserve the original featured photographs, keyboard navigation, swiping, and reduced-motion behavior. Pages are rendered as complete HTML, so direct links and basic content/navigation also work without JavaScript.

Browser checks cover every route on desktop and mobile, client navigation and browser history, navigation focus management, announcement tabs, galleries, downloads, and JavaScript-disabled access:

```sh
npx playwright install chromium
npm test
```

For an existing system Chrome installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable instead of downloading a browser.

The repository-root workflow, `../.github/workflows/static.yml`, installs dependencies, checks the Svelte/TypeScript source, builds and verifies the static site, runs the browser checks, and deploys the result on pushes to `main` or a manual workflow run. It also continues to publish the existing application from `../app/` at `/portal/`.

In the repository's **Settings → Pages**, keep **Source** set to **GitHub Actions**. The workflow reads the deployment path from `actions/configure-pages`, so both a custom-domain/root deployment and a repository deployment such as `/mva/` use the correct link and asset paths. The canonical URLs remain on `https://veterans.mt/`.

To reproduce a repository-path build locally, apply the same prefix to the build and its checks:

```sh
BASE_PATH=/mva npm run build
BASE_PATH=/mva npm run verify
BASE_PATH=/mva npm test
```

Use a plain `npm run build` again for a root-path preview. The static output needs no Node.js server in production.
