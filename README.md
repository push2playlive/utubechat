# TokCoin - Be Social. Get Paid.

TokCoin is a short-form video platform where users can create, share, and earn TokCoins for their engagement.

## 🎨 Customization Guide

### 🖼️ Logo and Favicon
To replace the default logo and favicon:
1.  **Favicon**: Replace `public/favicon.ico` with your own icon file.
2.  **App Logo (Desktop)**: In `src/App.tsx`, look for the `TokCoin Logo` section (around line 506). Update the `src` and `style.backgroundImage` URLs to point to your new logo.
3.  **App Logo (Mobile)**: In `src/components/TopNav.tsx`, update the logo image source.

### 🌈 Main Colors
The application uses Tailwind CSS v4. You can find and modify the main colors in `src/index.css` under the `@theme` block or by searching for the following hex codes:

- **Background**: `black` (#000000) and `#050505` (Sidebar/Header).
- **Primary Accent**: `amber-500` (#f59e0b) - Used for buttons, active states, and highlights.
- **Secondary Accent**: `yellow-500` (#eab308) - Used for TokCoin icons and balance displays.
- **Borders**: `#9298a6` - The standardized border color used throughout the app.
- **Text**: `white` (#FFFFFF) for primary text and `gray-400`/`gray-500` for secondary text.

To change these globally, you can add them to the `@theme` block in `src/index.css`:
```css
@theme {
  --color-primary: #f59e0b; /* Change this to your desired accent color */
  --color-border-custom: #9298a6;
}
```

---

## 🗄️ Supabase Database Schema

To set up your Supabase backend, run the following SQL in your Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  coins BIGINT DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos Table
CREATE TABLE videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  song TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  effect TEXT,
  custom_effect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner Sites Table
CREATE TABLE partner_sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  icon TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Example Policy: Anyone can read videos
CREATE POLICY "Public videos are viewable by everyone" ON videos
  FOR SELECT USING (true);

-- Example Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

## 🚀 Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**: `npm install`
3.  **Set up environment variables**: Create a `.env` file based on `.env.example` and add your Supabase credentials.
4.  **Run the development server**: `npm run dev`
