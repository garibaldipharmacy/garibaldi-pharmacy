# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Shipping a change

1. Branch off `main` and open a PR. CI runs the tests and Lighthouse; nothing deploys.
2. Try it on staging (<https://staging.garibaldipharmacy.com>) by pushing the branch to `staging`:

   ```bash
   git push -f origin HEAD:staging
   ```

   Staging shows one branch at a time, and nobody commits to `staging` directly, so the force push is fine. It deploys in about 10 minutes, once the checks pass.
3. Merge the PR to `main`. Production does not change yet.
4. Approve the production deploy: Actions > the run for the merge > **Review deployments** > tick **production** > **Approve and deploy**. GitHub also emails a link.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
