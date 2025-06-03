# CI/CD Setup Guide for ProductSpecMaster

This guide explains how to use the CI/CD pipeline we've set up for your ProductSpecMaster project.

## Overview

We've configured a complete CI/CD (Continuous Integration/Continuous Deployment) pipeline using GitHub Actions that:

1. Runs tests automatically when you push code
2. Builds your application
3. Deploys your frontend to Netlify
4. Deploys your backend to Render

## How It Works

The workflow is defined in `.github/workflows/ci.yml` and includes these stages:

1. **Lint and Test**: Runs TypeScript checks, linting, and all tests
2. **Build**: Creates production-ready builds of your application
3. **Deploy Frontend**: Deploys the frontend to Netlify
4. **Deploy Backend**: Deploys the backend to Render

## Required Setup

Before your CI/CD pipeline will work properly, you need to set up a few things:

### 1. GitHub Repository Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: The site ID for your Netlify site
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key

### 2. Netlify Setup

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Create a new site from your GitHub repository
3. Get your site ID from Site settings → General → Site details → Site ID
4. Create a personal access token at User settings → Applications → Personal access tokens

### 3. Render Setup

1. Create a Render account at [render.com](https://render.com/)
2. Create a new Web Service pointing to your repository
3. Get your service ID from the URL when viewing your service (format: `srv-xxxxxxxxxxxx`)
4. Create an API key in your account settings

## How to Use

### For Development

1. Make changes to your code
2. Push to a feature branch
3. Create a pull request to `main`
4. The CI pipeline will run tests but won't deploy

### For Deployment

1. Merge your PR to `main`
2. The CI pipeline will automatically:
   - Run all tests
   - Build the application
   - Deploy to Netlify and Render

You can also manually trigger a deployment by going to the Actions tab in your GitHub repository, selecting the "CI/CD Pipeline" workflow, and clicking "Run workflow".

## Configuration Files

We've added several configuration files to your project:

1. **netlify.toml**: Configures Netlify builds and redirects
2. **render.yaml**: Defines your Render services and databases
3. **netlify/functions/api.js**: A serverless function to proxy API requests

## Troubleshooting

If deployments fail, check:

1. GitHub Actions logs for detailed error messages
2. That all required secrets are properly set
3. That your Netlify and Render accounts have the correct permissions

## Next Steps

1. Set up your Netlify and Render accounts
2. Add the required secrets to your GitHub repository
3. Push a change to main to trigger your first deployment
