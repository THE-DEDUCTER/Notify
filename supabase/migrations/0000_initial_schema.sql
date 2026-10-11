-- Initial Database Schema for Notify

-- Create enum types
CREATE TYPE user_role AS ENUM ('Student', 'Faculty', 'Assistant', 'Admin');
CREATE TYPE complaint_status AS ENUM ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Pending Confirmation', 'Resolved', 'Reopened', 'Closed', 'Removed');
CREATE TYPE complaint_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE vote_type AS ENUM ('Upvote', 'Downvote');

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Complaints Table
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status complaint_status DEFAULT 'Submitted' NOT NULL,
    severity complaint_severity DEFAULT 'Low' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    raiser_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL
);

-- Attachments Table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Votes Table
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    vote_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(complaint_id, user_id) -- One vote per user per complaint
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (To be refined based on strict app requirements)
-- Profiles: Users can read all profiles (needed for assistants/admins), but only update their own.
CREATE POLICY "Profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Complaints: Everyone can read complaints (anonymity handled in application layer or via views)
CREATE POLICY "Complaints are viewable by everyone." ON complaints FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create complaints." ON complaints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Assistants and Admins can update complaints." ON complaints FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('Assistant', 'Admin')
    )
    OR auth.uid() = raiser_id -- Raiser needs to update status to Resolved/Reopened
);

-- More specific policies will be needed to fully enforce the SLA and anonymity strictly at DB level, 
-- but application-level enforcement combined with base RLS is a good starting point for the MVP.
