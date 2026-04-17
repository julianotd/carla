
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUser() {
    const userId = process.argv[2];
    if (!userId) {
        console.error('UserId required');
        return;
    }

    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
        console.error('Error fetching user:', error);
        return;
    }

    if (!user) {
        console.error('User not found');
        return;
    }

    console.log('User Status:');
    console.log('Email:', user.email);
    console.log('Confirmed At:', user.confirmed_at);
    console.log('Last Sign In:', user.last_sign_in_at);
    console.log('Role:', user.role);
    console.log('Banned:', user.banned_until);
}

checkUser();
