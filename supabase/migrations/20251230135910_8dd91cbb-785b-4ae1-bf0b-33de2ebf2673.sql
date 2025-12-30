-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete food logs first (depends on user_food_states)
  DELETE FROM public.food_logs WHERE user_id = auth.uid();
  
  -- Delete user food states
  DELETE FROM public.user_food_states WHERE user_id = auth.uid();
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;