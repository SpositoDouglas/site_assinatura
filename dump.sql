CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL
);


CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  signature_base64 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signature_id UUID REFERENCES signatures(id) ON DELETE CASCADE,
  is_valid BOOLEAN NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE signatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs DISABLE ROW LEVEL SECURITY;