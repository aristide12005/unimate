-- 14_admin_panel_upgrade.sql

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system', -- 'system', 'message', 'alert', 'promotion'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for Notifications

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can insert notifications (for everyone or specific users)
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Broadcast Function (Admin Only via RLS on insert, but helper function for convenience)
CREATE OR REPLACE FUNCTION public.broadcast_message(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'system',
    p_action_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Check if executer is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Insert notification for ALL users
    INSERT INTO public.notifications (user_id, title, message, type, action_url)
    SELECT id, p_title, p_message, p_type, p_action_url
    FROM public.profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure Admin Access for Other Tables (Reports, Blocked Users, Contracts)

-- Reports: Admins view all (already likely handled in 1_setup_reports... but reinforcing)
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (public.is_admin());

-- Reports: Admins can update reports (to resolve/dismiss)
CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- Blocked Users: Admins can view all
DROP POLICY IF EXISTS "Admins can view all blocked users" ON public.blocked_users;
CREATE POLICY "Admins can view all blocked users"
ON public.blocked_users FOR SELECT
TO authenticated
USING (public.is_admin());

-- Contracts: Admins can view all (already in 2_setup... but reinforcing)
DROP POLICY IF EXISTS "Admins can view all contracts" ON public.contracts;
CREATE POLICY "Admins can view all contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (public.is_admin());

-- Contracts: Admins can update contracts (if intervention needed)
CREATE POLICY "Admins can update all contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

