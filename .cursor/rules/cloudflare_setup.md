# Cloudflare Pages Configuration for Physia

## Required GitHub Secrets Environment Variables

For deployment to work properly, you need to configure the following secrets in your GitHub repository:

### 1. Cloudflare API Credentials

- `CLOUDFLARE_API_TOKEN` - API token with Cloudflare Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Project name in Cloudflare Pages

### 2. Application Environment Variables

- `SUPABASE_URL` - Your Supabase instance URL
- `SUPABASE_PUBLIC_KEY` - Supabase public key (anon key)

## Configuration Instructions

### Step 1: Create Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** > **API Tokens**
3. Click **Create Token**
4. Use **"Custom token"** template with the following permissions:
   - **Account** - `Cloudflare Pages:Edit`
   - **Zone Resources** - `Include All zones` (if using custom domain)

### Step 2: Find Account ID

1. In Cloudflare Dashboard, go to **Overview**
2. In the right sidebar you'll find **Account ID**
3. Copy the value

### Step 3: Create Project in Cloudflare Pages

1. In Cloudflare Dashboard go to **Pages**
2. Click **Create a project**
3. Choose **Direct Upload** (don't connect to Git - we use GitHub Actions)
4. Enter project name (e.g. "physia-app")
5. This name will be the value for `CLOUDFLARE_PROJECT_NAME`

### Step 4: Configure GitHub Secrets

1. In GitHub repository go to **Settings** > **Secrets and variables** > **Actions**
2. Add all required secrets:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_PROJECT_NAME=physia
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLIC_KEY=your_supabase_anon_key

```

## Project Changes

### 1. Astro Configuration

Project has been configured to automatically use Cloudflare adapter when building for Pages:

- Added `@astrojs/cloudflare` adapter
- Configuration automatically switches between Node.js (local) and Cloudflare (production)
- New `npm run build:cloudflare` script for building on CF Pages

### 2. GitHub Actions Workflow

Created workflow `.github/workflows/main.yml`:

- **Linting** - Code quality check with ESLint
- **TypeScript Check** - Type verification
- **Unit Tests** - Run unit tests
- **Build & Deploy** - Build and deploy to Cloudflare Pages
- **Status Report** - Deployment summary

## Automatic Deployment

After configuring secrets:

### Automatic deployment:

- Every push to `main` branch automatically deploys the application to production

### Manual deployment:

- In GitHub Actions you can run workflow manually from "Actions" tab
- Choose "Deploy to Cloudflare Pages" → "Run workflow"

### Deployment process:

1. Run tests and code quality checks
2. Build application for Cloudflare Pages
3. Deploy to production
4. Display status report

## Troubleshooting

### Common issues:

1. **"Invalid API token"** - Check if token has proper permissions
2. **"Project not found"** - Check project name in `CLOUDFLARE_PROJECT_NAME`
3. **"Build failed"** - Check if all environment variables are configured

### Useful commands:

```bash
# Local build for Cloudflare
npm run build:cloudflare

# Local test with Node.js adapter
npm run build
npm run preview
```
