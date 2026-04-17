
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setAdminById() {
    const userId = process.argv[2];
    if (!userId) {
        console.error('UserId required');
        return;
    }

    console.log(`Processing ID: ${userId}...`);

    // 1. Check if user exists in Auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !user) {
        console.error('User not found in Auth system:', authError?.message);
        return;
    }

    console.log(`User found: ${user.email}`);

    // 2. Ensure Profile exists
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
            avatar_url: user.user_metadata?.avatar_url || null
        }, { onConflict: 'id' });

    if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
    }

    // 3. Set Role
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
            user_id: userId,
            role: 'admin'
        }, { onConflict: 'user_id,role' });

    if (roleError) {
        console.error('Error setting role:', roleError);
    } else {
        console.log('Success! User is now an admin.');
    }
}

setAdminById();
