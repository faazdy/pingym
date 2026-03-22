-- EXTENSION PARA GENERAR UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','trainer', 'client')) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE clients_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  eps TEXT,
  photo TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE client_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients_profile(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active','expired','pending')) DEFAULT 'active'
);


CREATE TABLE lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  locker_number INT,
  status TEXT CHECK (status IN ('available','occupied')) DEFAULT 'available'
);


CREATE TABLE client_lockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients_profile(id) ON DELETE CASCADE,
  locker_id UUID REFERENCES lockers(id),
  start_date DATE,
  end_date DATE
);


CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  description TEXT
);


CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trainer_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INT,
  reps INT,
  suggested_weight NUMERIC
);


CREATE TABLE client_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients_profile(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients_profile(id),
  exercise_id UUID REFERENCES exercises(id),
  weight NUMERIC,
  reps INT,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id),
  client_id UUID REFERENCES clients_profile(id),
  check_in TIMESTAMP DEFAULT NOW()
);
