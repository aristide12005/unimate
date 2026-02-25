# uniMate - Student Housing & Roommate Finder

## Project Overview

uniMate is a cross-platform mobile and web application for finding roommates and student housing. Built with React, TypeScript, Vite, and Capacitor for iOS/Android deployment.

**Features:**
- User authentication (email/password + Google OAuth)
- Room/housing listings with search and filters
- Real-time chat system
- Contract management between hosts and seekers
- Admin dashboard with analytics
- Push notifications (mobile)
- Camera integration for photo uploads
- Report and blocking system

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Mobile**: Capacitor 8 (iOS/Android)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query (TanStack)
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+ (recommended: 22.13.1)
- npm or yarn
- For mobile builds: Xcode (iOS) or Android Studio (Android)

## Setup Instructions

### 1. Clone and Install

```sh
git clone <YOUR_GIT_URL>
cd uniMate
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your values:

```sh
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_SECRET=your-secure-admin-secret
```

**Important:** Never commit `.env` files to git. The `.gitignore` is configured to exclude them.

### 3. Database Setup

This project uses Supabase. Run the SQL migration files in order:

1. Connect to your Supabase project
2. Execute the SQL files from the root directory in order (1 through 15)
3. Or use Supabase CLI: `supabase db reset` (if using local development)

### 4. Development

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### 5. Mobile Development

```sh
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync web build to native platforms
npx cap sync

# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android
```

## Project Structure

```
src/
├── pages/           # Screen components
│   ├── admin/       # Admin dashboard pages
│   ├── host/        # Host listing wizard
│   ├── settings/    # Settings screens
│   └── contract/    # Contract pages
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom hooks
├── services/        # Service modules
├── integrations/    # Third-party integrations
│   └── supabase/    # Supabase client
└── types/           # TypeScript types
```

## Deployment

### Web (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Mobile (via Codemagic)

The project includes `codemagic.yaml` for CI/CD:

1. Update the email recipient in `codemagic.yaml`
2. Connect your repository to Codemagic
3. Build will generate unsigned IPA (iOS) and APK (Android)

## Security Notes

- Keep your `VITE_ADMIN_SECRET` secure and use a strong random value
- Never commit `.env` files or real credentials
- The admin signup requires the secret code to prevent unauthorized access
- All database access is through Supabase RLS (Row Level Security)

## License

[Add your license here]

## Support

[Add your support contact here]
