<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

[![CI Pipeline](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/ci.yml)
[![Matrix CI](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/matrix-ci.yml/badge.svg)](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/matrix-ci.yml)
[![Node Version](https://img.shields.io/badge/node-16%20|%2018%20|%2020-blue)]()

> ✅ **CI status badges** — Replace `YOUR-ORG` and `YOUR-REPO` in the badge URLs above with your actual GitHub org/repo name.

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/dd3a14f9-8704-4b4f-afaa-639bf9a2d27b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## CI/CD Pipelines

This project includes two CI/CD workflows:

### Assignment 1: `ci.yml`
- Triggers on **push** and **pull_request** to `master`
- **3 parallel jobs**: Lint → Test → Build
- Caches npm dependencies (via `actions/setup-node --cache=npm`)
- **Deploy** step to Firebase Hosting (only on `master` push)
- ✅ Green check badge above

### Assignment 2: `matrix-ci.yml`
- **Matrix testing** on Node.js 16, 18, and 20
- All matrix tests must pass before Build runs
- Build triggers only on **push to `main`** or **version tags (`v*.*.*`)**
- **Scheduled run**: nightly at 06:00 UTC
- **Manual `workflow_dispatch`** with `skip_build` input
- **Artifacts**: test results per variant + build output (`dist/`)
- **Concurrency**: cancels superseded runs on the same branch

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run lint:tsc` | Type-check with tsc |
