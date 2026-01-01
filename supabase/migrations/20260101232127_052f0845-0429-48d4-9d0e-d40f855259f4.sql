-- Add DELETE policy for user_achievements to allow revoking achievements
CREATE POLICY "Users can delete their own achievements" 
ON public.user_achievements 
FOR DELETE 
USING (auth.uid() = user_id);