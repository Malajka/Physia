-- Enable row-level security on sessions table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT only their own sessions
CREATE POLICY "Users can select their own sessions" ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id); 