-- Supabase Schema for utubechat & Command Nexus

-- 1. Users Table (Core Profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    photo_url TEXT,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'guest')),
    coins BIGINT DEFAULT 100,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    referrals INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bio TEXT,
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Public Profiles (For faster public access)
CREATE TABLE IF NOT EXISTS public.public_profiles (
    id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    display_name TEXT,
    photo_url TEXT,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    coins BIGINT DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    author TEXT,
    author_photo TEXT,
    description TEXT,
    song TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_promoted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id TEXT PRIMARY KEY, -- user_id + video_id
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id TEXT PRIMARY KEY, -- follower_id + following_id
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Assets Table (Crypto)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    balance TEXT DEFAULT '0.00',
    color TEXT,
    icon TEXT,
    change24h NUMERIC DEFAULT 0,
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Missions Table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reward INTEGER DEFAULT 0,
    type TEXT CHECK (type IN ('daily', 'weekly', 'achievement')),
    progress INTEGER DEFAULT 0,
    total INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7.1 User Courses Table (For Ascension Logic)
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_title TEXT NOT NULL,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. System Config Table
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY, -- 'global'
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES public.users(id)
);

-- 9. Chats & Messages
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participants UUID[] NOT NULL,
    last_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users: Read own, update own
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public Profiles: Everyone can read, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.public_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own public profile" ON public.public_profiles FOR UPDATE USING (auth.uid() = id);

-- Videos: Everyone can read, users can create/update/delete own
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Users can insert own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own videos" ON public.videos FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own videos" ON public.videos FOR DELETE USING (auth.uid() = author_id);

-- Likes: Read all, users can insert/delete own
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Follows: Read all, users can insert/delete own
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Assets: Read own, update own (via RPC)
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);

-- Missions: Read own, update own (via RPC)
CREATE POLICY "Users can view own missions" ON public.missions FOR SELECT USING (auth.uid() = user_id);

-- RPC Functions for Atomic Operations

-- 1. Increment Video Likes
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.videos SET likes = likes + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Decrement Video Likes
CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.videos SET likes = likes - 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Increment User Coins
CREATE OR REPLACE FUNCTION public.increment_user_coins(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.users SET coins = coins + amount WHERE id = user_id;
    UPDATE public.public_profiles SET coins = coins + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Swap Coins for Crypto
CREATE OR REPLACE FUNCTION public.swap_coins_for_crypto(user_id UUID, coin_amount INTEGER, crypto_symbol TEXT, crypto_gain NUMERIC)
RETURNS void AS $$
BEGIN
    UPDATE public.users SET coins = coins - coin_amount WHERE id = user_id;
    UPDATE public.public_profiles SET coins = coins - coin_amount WHERE id = user_id;
    UPDATE public.assets SET balance = (balance::numeric + crypto_gain)::text WHERE user_id = user_id AND symbol = crypto_symbol;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Complete Mission and Reward
CREATE OR REPLACE FUNCTION public.complete_mission_and_reward(user_id UUID, mission_id UUID, reward_amount INTEGER, total_progress INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.missions SET completed = true, progress = total_progress WHERE id = mission_id AND user_id = user_id;
    PERFORM public.increment_user_coins(user_id, reward_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Set Admin Role (Run this manually for your email)
-- UPDATE public.users SET role = 'admin' WHERE email = 'findlaygary25@gmail.com';
-- UPDATE public.public_profiles SET role = 'admin' WHERE id = (SELECT id FROM public.users WHERE email = 'findlaygary25@gmail.com');

-- 7. Ascension Logic: Check Guru Eligibility
CREATE OR REPLACE FUNCTION public.check_guru_eligibility(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    join_date TIMESTAMP;
    courses_completed INTEGER;
BEGIN
    -- 1. Check when they joined (using public.users table)
    SELECT created_at INTO join_date FROM public.users WHERE id = user_id;
    
    -- 2. Check how many courses they bought/finished
    SELECT count(*) INTO courses_completed FROM public.user_courses WHERE user_id = user_id AND status = 'completed';

    -- 3. The Rule: Must be 6 months (180 days) AND 6 courses
    IF (join_date <= NOW() - INTERVAL '6 months') AND (courses_completed >= 6) THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
