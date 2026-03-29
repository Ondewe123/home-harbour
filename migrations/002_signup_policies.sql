-- Fix: Allow authenticated users to insert during signup
-- (At signup time, the user has no row in `users` yet, so the original policies block them)

-- Allow any authenticated user to create a household
CREATE POLICY "Authenticated users can create a household" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any authenticated user to insert their own user record
CREATE POLICY "Authenticated users can create their user record" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Allow users to update their own record
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (auth_id = auth.uid());
