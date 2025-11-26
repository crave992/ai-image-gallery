# AI Image Gallery

Upload your images, and let AI do the heavy lifting! This app automatically tags your photos, describes what's in them, and helps you find similar images. Think of it as your personal photo assistant that never forgets what's in your pictures.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)
- **Database & Auth**: Supabase
- **AI Service**: Google Gemini API (Gemini 2.5 Flash)
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

## 🏗️ How We Built This

I made some key decisions while building this that I think are worth sharing. These aren't just random choices - each one solves a real problem.

### Why Server Components First?

I default to Server Components because they're faster and cheaper. Less JavaScript means faster page loads, and doing work on the server means less API calls from the client. I only use Client Components when I actually need interactivity - buttons, forms, that kind of thing.

### Organizing by Feature, Not Type

Instead of separating everything into "server" and "client" folders, I organize by what the code does. So all the auth stuff lives together, all the gallery stuff lives together. It's way easier to find things when you're working on a specific feature.

### One Place for All Styles

I put all the design tokens (colors, spacing, fonts) in one file (`theme.ts`). Want to change the primary color? Change it once, and it updates everywhere. It also makes the light/dark mode toggle super simple.

### React Query for Server State

I use React Query for anything that comes from the server (images, metadata, etc.) and regular React state for UI stuff (is this modal open? what's in this form?). React Query handles caching, refetching, and error states automatically, which saves me a ton of boilerplate.

### AI Processing in the Background

When you upload an image, it gets saved immediately. The AI analysis happens in the background, so your upload doesn't hang while waiting for tags. If the AI fails, your image is still there - you can just retry the analysis later.

### TypeScript Everywhere

I use TypeScript strictly - no `any` types allowed. It catches bugs before they happen and makes refactoring way less scary. All the types live in one place so they're easy to find and update.

### Database-Level Security

I use Supabase's Row Level Security so users can only see their own images. This happens at the database level, not just in the app code, which is way more secure. Even if I mess up the app code, the database won't let users see each other's stuff.

### Testing What Matters

I write tests for the core utilities - search functions, image processing, that kind of thing. These are the parts that are easy to test and where bugs would be really annoying. Component tests are on the todo list, but the utility tests catch most issues.

### Mobile First

I design for mobile first because that's where most people will use this. Desktop gets the enhanced experience, but mobile works great too. Touch targets are big enough, text is readable, and everything fits on a small screen.

### Toast Notifications, Not Console Errors

When something goes wrong, users see a toast notification, not a console error. It's way more helpful and doesn't break their workflow.

## 🛠️ Getting Started

Hey there! Let's get you set up. Don't worry, it's pretty straightforward. You'll need a few things first, but most of them are free.

### What You'll Need

- **Node.js 20+** - If you don't have it, grab it from [nodejs.org](https://nodejs.org/) (the LTS version is your best bet)
- **A package manager** - npm comes with Node.js, so you're good to go
- **A Supabase account** - Free tier is perfect for getting started ([sign up here](https://supabase.com))
- **A Google account** - Just for the Gemini API key (also free!)

### Step 1: Clone and Install

First things first - get the code and install the dependencies:

```bash
git clone <repository-url>
cd ai-image-gallery
npm install
```

### Step 2: Get Your Supabase Keys

You'll need a Supabase account (it's free). Here's how to get set up:

1. Head over to [supabase.com](https://supabase.com) and sign up
2. Create a new project (takes about 2 minutes)
3. Once it's ready, go to Settings → API
4. Copy these three things:
   - Your Project URL (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - The anon/public key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - The service_role key (this is your `SUPABASE_SERVICE_ROLE_KEY`)
     - ⚠️ **Important**: Keep the service_role key secret! Never put it in client-side code.

You'll also need to set up the database tables and storage. Check the project docs for the SQL schema, or just create a bucket called `images` in Storage and set it up for authenticated users.

### Step 3: Get Your Gemini API Key

This is super easy:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key it gives you

The free tier gives you 1,500 requests per day, which is plenty for development and testing.

### Step 4: Set Up Your Environment Variables

Create a `.env.local` file in the root directory and add your keys:

```env
# Supabase stuff
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (usually just localhost for dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Quick security note**: The `.env.local` file is already in `.gitignore`, so it won't get committed. The `NEXT_PUBLIC_*` variables are safe to expose (they're meant for the browser), but keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` secret - they're server-only.

### Step 5: Fire It Up

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. If everything's set up right, you should see the app!

### Optional: Run the Tests

If you want to make sure everything's working:

```bash
npm test
```

There are 41+ tests covering the core utilities, so if they all pass, you're good to go.

## 🔑 What API Keys Do I Need?

You'll need a few keys to get this running. Here's the breakdown:

**Required:**

- **Supabase URL** - Your project URL from Supabase
- **Supabase Anon Key** - The public key (safe to expose)
- **Supabase Service Role Key** - The secret key (keep this safe!)
- **Gemini API Key** - From Google AI Studio

**Optional:**

- `NEXT_PUBLIC_APP_URL` - Defaults to `http://localhost:3000` if you don't set it

**Security tips:**

- Never commit your `.env.local` file (it's already ignored)
- Use different keys for dev and production
- The service role key is powerful - keep it secret and only use it server-side
- If you think a key might be exposed, rotate it ASAP

## 🔧 A Bit More About Supabase

I use three Supabase environment variables:

1. **NEXT_PUBLIC_SUPABASE_URL** - Your project URL. This one's safe to expose (it's public anyway).

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - The public key. Also safe to expose because it's protected by Row Level Security at the database level.

3. **SUPABASE_SERVICE_ROLE_KEY** - The secret one. Keep this safe! It bypasses security, so only use it server-side for admin stuff.

There are three different Supabase clients in the code:

- **Server Client** - For Server Components. Handles sessions automatically.
- **Client Client** - For Client Components. Respects security rules.
- **Admin Client** - For admin operations only. Use this sparingly.

The middleware automatically refreshes your session on each request, so you don't have to worry about it.

## 📝 For Developers

### When to Use Client vs Server Components

Here's my rule of thumb: if it needs to be interactive (buttons, forms, modals), use a Client Component. Otherwise, use a Server Component. Server Components are faster and cheaper.

Ask yourself:

- Does it need interactivity? → Client Component
- Does it use browser APIs? → Client Component
- Does it use React hooks? → Client Component
- Does it fetch server data? → Server Component

### Code Style

I try to keep things simple:

- Functional code, not classes
- Descriptive variable names (like `isLoading` instead of `loading`)
- Proper error handling everywhere
- Zod for validation (catches bugs early)
- Comments only when the logic is actually complex

## 🤖 About the AI (Google Gemini)

I'm using Google's Gemini API (specifically Gemini 2.5 Flash) to analyze images. Here's why I picked it:

### Why Gemini?

I looked at a few options, and Gemini won out because:

1. **It has a free tier** - 1,500 requests per day is plenty for development
2. **It's cheap** - $0.0001 per image vs OpenAI's $0.01 (that's 100x cheaper!)
3. **The quality is great** - Tags are spot-on, colors are accurate, descriptions are natural
4. **It's easy to use** - Simple API, good docs, works well with TypeScript
5. **It's reliable** - It's Google, so uptime is solid

### Gemini vs OpenAI

I compared it to OpenAI Vision, and here's how they stack up:

| Feature               | Google Gemini | OpenAI Vision |
| --------------------- | ------------- | ------------- |
| **Free Tier**         | ✅ 1,500/day  | ❌ No         |
| **Cost (per image)**  | $0.0001       | $0.01         |
| **Tag Quality**       | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐    |
| **Color Extraction**  | ✅ Excellent  | ✅ Good       |
| **Setup Complexity**  | ⭐ Easy       | ⭐ Easy       |
| **API Response Time** | ~2-3s         | ~3-5s         |

Both are great, but Gemini's free tier and lower cost made it the obvious choice for this project. If you're building something similar, you might want to consider both, but for most use cases, Gemini is the better deal.

### What the AI Actually Does

When you upload an image, the AI:

1. **Generates 5-10 tags** - It understands what's in the image and creates relevant tags. It's smart about plurals and variations, and it filters out generic tags when there are more specific ones.

2. **Writes a description** - One sentence that actually describes what's in the image, not just a list of objects. It's pretty good at this.

3. **Finds the dominant colors** - Extracts the top 3 colors as hex codes. This is used for the color filter feature.

### How It Works

The AI processing happens in the background, so your upload doesn't hang. Here's the flow:

1. You upload an image → it gets saved immediately
2. A metadata record is created with status "pending"
3. A background job kicks off the AI analysis
4. Status updates: `pending` → `processing` → `completed` (or `failed` if something goes wrong)
5. The UI automatically refreshes to show you the results

If the AI fails for some reason, you can retry it. Your image is still there, it just doesn't have tags yet.

I'm using `gemini-2.5-flash` as the primary model, with `gemini-1.5-flash` as a fallback. Both are fast and accurate.

## 🎯 What's Done, What's Next

**Done:**

- ✅ Project setup
- ✅ Supabase integration
- ✅ Authentication (sign up, sign in, sign out)
- ✅ Image upload with drag & drop
- ✅ AI-powered tagging and descriptions
- ✅ Search by text, color, and similarity
- ✅ Mobile-responsive UI
- ✅ Light/dark mode
- ✅ Unit tests for core utilities

**Future ideas:**

- More advanced search filters
- Batch operations
- Image editing features
- Better error recovery
- Performance optimizations

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

## 📖 Other Stuff

### Testing

I've got tests for the core utilities - search functions, image processing, downloads, that kind of thing. To run them:

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode (re-runs on file changes)
npm run test:coverage # See how much code is covered
```

Right now there are 41+ tests covering the important utilities. Component tests are on the todo list, but the utility tests catch most bugs.

## 📄 License

MIT
