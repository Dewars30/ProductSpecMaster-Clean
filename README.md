# ProductSpecMaster - AI-Powered Product Specification Management

A modern, intelligent platform for managing, analyzing, and extracting insights from product specifications with Google Drive integration and AI-powered capabilities.

## ✨ Features

- **Google Drive Integration**: Seamlessly sync and edit your product specifications from Google Drive
- **AI-Powered Search**: Ask natural language questions across all your specifications
- **Specification Analysis**: Extract requirements, dependencies, and actionable insights with AI
- **Immersive Editor**: Clean, distraction-free specification writing experience
- **Three-Pane Layout**: Browse, query, and edit specifications in one unified workspace

## 🚀 Quick Start (Replit)

1. **Clone this repository to Replit**
2. **Set up environment variables** in Replit Secrets:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `GOOGLE_CLIENT_ID`: Google OAuth Client ID  
   - `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
   - `OPENAI_API_KEY`: OpenAI API key for AI features

3. **Run the database migration**:
   ```sql
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS google_access_token VARCHAR,
   ADD COLUMN IF NOT EXISTS google_refresh_token VARCHAR;
   ```

4. **Click Run** and start using ProductSpecMaster!

## 💻 Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ProductSpecMaster.git
   cd ProductSpecMaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🧪 Testing

This project uses Vitest for unit and integration testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📚 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed instructions including:
- Google Cloud Console setup
- Database configuration
- OAuth redirect URI configuration
- Troubleshooting common issues

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **AI**: OpenAI GPT-4o for specification analysis, summarization, and RAG search
- **Auth**: Replit Auth + Google OAuth for secure authentication
- **Storage**: Google Drive integration for specification storage and version control

## 📂 Project Structure

```
├── client/                  # Frontend React application
│   ├── components/          # UI components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   └── utils/               # Frontend utilities
├── server/                  # Backend Node.js application
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── tests/               # Test files
│   │   ├── controllers/     # Controller tests
│   │   ├── integration/     # Integration tests
│   │   ├── middleware/      # Middleware tests
│   │   ├── routes/          # Routes tests
│   │   ├── services/        # Service tests
│   │   └── utils/           # Utility tests
│   └── utils/               # Backend utilities
├── shared/                  # Shared code between client and server
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Shared utilities
├── migrations/              # Database migration files
└── .github/                 # GitHub configuration
    ├── ISSUE_TEMPLATE/      # Issue templates
    └── workflows/           # CI/CD workflows
```

## 🎯 Use Cases

- **Product Development**: Track and analyze product specifications across multiple versions
- **Engineering Teams**: Extract technical requirements and dependencies from specifications
- **Project Management**: Identify actionable items and development milestones
- **Knowledge Base**: Build a searchable repository of product specifications

## 📖 Usage

1. **Sign in** with your Replit account
2. **Connect Google Drive** to authorize specification access
3. **Sync specifications** to import your files
4. **Ask questions** using natural language about your specifications
5. **Edit specifications** with AI assistance
6. **Extract insights** with one-click AI features

## 🔐 Privacy & Security

- Product specifications are stored securely in your database
- Google OAuth tokens are encrypted
- AI processing uses OpenAI's API (see their privacy policy)
- No data is shared with third parties

## 🐛 Troubleshooting

Common issues and solutions:

**Google OAuth Errors**:
- Verify redirect URI matches your Replit domain exactly
- Check Google Cloud Console API settings

**Database Errors**:
- Ensure DATABASE_URL is correct
- Run the migration SQL command

**AI Features Not Working**:
- Verify OPENAI_API_KEY is valid and has sufficient credits
- Check if specifications have been properly synced from Google Drive

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

This is a personal project template. Feel free to fork and customize for your own use!

---

Built with ❤️ using modern web technologies
