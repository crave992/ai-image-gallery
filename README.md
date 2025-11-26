# AI Image Gallery

A modern web application where users can upload images, get automatic AI-generated tags and descriptions, and search through their images using text or find similar images.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)
- **Database & Auth**: Supabase
- **State Management**: TanStack React Query
- **Validation**: Zod
- **Architecture**: Server-First (React Server Components by default)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages (Server Components)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── server/            # Server Components (RSC)
│   ├── client/            # Client Components (interactive)
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── server/            # Server-only utilities
│   │   └── supabase-server.ts
│   ├── client/            # Client-only utilities
│   │   ├── supabase-client.ts
│   │   └── query-provider.tsx
│   └── utils.ts           # Shared utilities
├── hooks/                 # React hooks
├── types/                 # TypeScript type definitions
└── ...
```

## 🏗️ Architecture Principles

### Server-First Architecture
- **Default to Server Components** - Only use Client Components when absolutely necessary
- **Clear Separation** - Server components in `/components/server/`, client components in `/components/client/`
- **Data Fetching** - Server-side in RSC, client-side only when needed

### Naming Conventions
- **Components**: kebab-case (e.g., `image-gallery.tsx`)
- **Directories**: lowercase with dashes
- **Files**: kebab-case for components, camelCase for utilities

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ 
- npm, yarn, pnpm, or bun
- Supabase account (for database and auth)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Service Configuration (to be configured after research)
   AI_SERVICE_API_KEY=your_ai_service_api_key
   AI_SERVICE_URL=your_ai_service_url

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database schema (to be provided in next steps)
   - Configure Row Level Security (RLS) policies
   - Set up Storage buckets for images

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Development Guidelines

### Component Creation Checklist

Before creating any component, ask:

1. **Does this component need interactivity?**
   - Yes → Client Component (`'use client'`)
   - No → Server Component (default)

2. **Does this component need browser APIs?**
   - Yes → Client Component
   - No → Server Component

3. **Does this component need React hooks?**
   - Yes → Client Component
   - No → Server Component

4. **Does this component fetch data?**
   - Server-side data → Server Component
   - Client-side data → Client Component

### Code Style
- Use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Implement proper error handling and validation
- Use Zod for schema validation
- Add JSDoc comments for complex logic

## 🎯 Next Steps

1. ✅ Project setup and structure
2. ⏳ Supabase configuration and database schema
3. ⏳ Authentication implementation
4. ⏳ Image upload functionality
5. ⏳ AI service integration
6. ⏳ Search features
7. ⏳ UI/UX implementation

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

## 📄 License

MIT
