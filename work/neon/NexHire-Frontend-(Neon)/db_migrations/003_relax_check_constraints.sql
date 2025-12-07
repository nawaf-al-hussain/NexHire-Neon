-- Fix 3: Relax pushnotifications platform CHECK constraint to be case-insensitive
-- The route POST /api/candidates/notifications/register-device sends 'web' (lowercase)
-- but the CHECK constraint requires 'Web' (capitalized). The original SSMS schema
-- likely had a case-insensitive collation. Easiest fix: allow lowercase variants.

ALTER TABLE public.pushnotifications
    DROP CONSTRAINT IF EXISTS pushnotifications_platform_check;

ALTER TABLE public.pushnotifications
    ADD CONSTRAINT pushnotifications_platform_check
    CHECK (platform ILIKE ANY (ARRAY['iOS', 'Android', 'Web', 'web', 'ios', 'android']));

-- Fix 4: Relax emailqueue emailtype CHECK constraint to allow 'Test' and other types
-- The route POST /api/maintenance/email-queue/send-test uses 'Test' as the default
-- emailtype, but the CHECK only allows InterviewInvite/StatusUpdate/Rejection/Offer.

ALTER TABLE public.emailqueue
    DROP CONSTRAINT IF EXISTS emailqueue_emailtype_check;

ALTER TABLE public.emailqueue
    ADD CONSTRAINT emailqueue_emailtype_check
    CHECK (emailtype IN (
        'InterviewInvite', 'StatusUpdate', 'Rejection', 'Offer',
        'Test', 'Welcome', 'Reminder', 'Notification', 'Other'
    ));
