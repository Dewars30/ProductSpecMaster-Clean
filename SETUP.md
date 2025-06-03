# ProductSpecMaster Setup Guide

This comprehensive guide will help you set up ProductSpecMaster for managing and analyzing product specifications with Google Drive integration.

## 🚀 Quick Setup Steps

### 1. **Database Setup for Product Specifications**
1. Go to [Neon Database](https://neon.tech) and create a free account
2. Create a new database project
3. Copy the connection string (should look like `postgresql://username:password@host/database`)
4. In Replit, go to **Secrets** (🔐) and add:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string

### 2. **Google Drive API Setup for Specification Access**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API** and **Google Docs API** (required for specification file access)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set Application type to **Web application**
6. Add your Replit domain to **Authorized redirect URIs**:
   - Format: `https://your-replit-app-name.replit.app/api/google/callback`
   - Replace `your-replit-app-name` with your actual Replit app name
7. Copy the Client ID and Client Secret
8. In Replit **Secrets**, add:
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Your Google Client ID
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: Your Google Client Secret

### 3. **OpenAI API Setup**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. In Replit **Secrets**, add:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

### 4. **Database Migration**
After setting up the database, run this SQL command in your Neon console:

```sql
-- Add Google OAuth token columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token VARCHAR,
ADD COLUMN IF NOT EXISTS google_refresh_token VARCHAR;
```

### 5. **Deploy and Test**
1. Click **Run** in Replit
2. Open the app URL provided by Replit
3. Sign in with your Replit account
4. Click "Connect Google Drive" to authorize access
5. Sync your product specifications and start using AI features!

## 💡 Advanced Configuration

### Custom Specification Templates
You can create template specifications in your Google Drive that ProductSpecMaster will recognize:

1. Create a folder named "PSM_Templates" in your Google Drive root
2. Add specification templates with names like "Hardware_Spec_Template.docx" or "API_Spec_Template.docx"
3. These will appear as template options when creating new specifications

### Organization & Tagging
ProductSpecMaster can automatically categorize your specifications:

1. Use consistent naming patterns (e.g., "ProjectName-ComponentName-v1.0")
2. Create a standardized folder structure in Google Drive
3. ProductSpecMaster will use these patterns to organize and tag content

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI features |
| `REPL_ID` | 🔄 | Auto-provided by Replit |
| `REPLIT_DOMAINS` | 🔄 | Auto-provided by Replit |
| `SESSION_SECRET` | 🔄 | Auto-provided by Replit |

## 🐛 Troubleshooting

### Google OAuth Issues
- **"redirect_uri_mismatch"**: Make sure your Google Cloud Console redirect URI exactly matches your Replit app URL
- **"Google Drive not connected"**: Complete the Google Drive authorization flow first
- **"No access token"**: Re-authorize Google Drive access

### Database Issues
- **Connection errors**: Verify your `DATABASE_URL` is correct and database is accessible
- **Missing columns**: Run the migration SQL command above

### AI Features Not Working
- **Invalid API key**: Check your `OPENAI_API_KEY` is valid and has credits
- **No specifications found**: Sync your Google Drive first

## 📝 App Usage

1. **Connect Google Drive**: Click the "Connect Google Drive" button and authorize access
2. **Sync Specifications**: After connecting, click "Sync Product Specifications" to import your files
3. **Browse & Search**: Navigate your specification library or use natural language search
4. **Edit Specifications**: Click on any specification to edit with AI assistance
5. **AI Analysis**: Use the AI panel to:
   - Generate summaries of technical requirements
   - Extract actionable development tasks
   - Identify dependencies between components
   - Check for completeness and consistency

## 🎯 Example Use Cases

- **Product Specification Analysis**: Upload multiple product specification versions and extract key elements
- **Technical Requirements**: Automatically extract and categorize requirements from specifications
- **Dependency Tracking**: Identify and track dependencies between product components
- **Version Comparison**: Compare different versions of specifications to track changes

## 🆘 Need Help?

If you encounter issues:
1. Check the Replit console for error messages
2. Verify all environment variables are set correctly
3. Make sure Google Cloud APIs are enabled
4. Check that your database migration completed successfully

## 🚀 Next Steps

Once everything is working:
1. Try uploading some product specifications to Google Drive
2. Sync them into ProductSpecMaster
3. Ask natural language questions about your product specifications
4. Use the AI features to extract insights and summaries

Happy product specification analyzing! 🎉