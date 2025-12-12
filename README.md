<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nFUReylisquoiCcy6BJCQ8B1Z4RHTXsZ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow:
1. Installs dependencies
2. Builds the production bundle
3. Deploys to GitHub Pages

To deploy manually, go to the Actions tab and run the "Deploy to GitHub Pages" workflow.

### Configuration

The app is configured to deploy at the base path `/gitTrunfoPVP/` for GitHub Pages. This is set in `vite.config.ts`:

```typescript
base: '/gitTrunfoPVP/',
```
