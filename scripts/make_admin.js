
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
// WARNING: This key is temporary. Do not commit or expose on client.
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function makeAdmin() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: node scripts/make_admin.js <email>');
        return;
    }

    console.log(`Searching for user: ${email}...`);

    // List users to find the ID (admin.getUserByEmail is not always available in all versions, listing is safer for simple scripts)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        console.error(`User not found: ${email}`);
        console.log('Make sure you have signed up on the site first.');
        return;
    }

    console.log(`Found user ${user.id}. Setting role to 'admin'...`);

    const { error: dbError } = await supabase
        .from('user_roles')
        .upsert({
            user_id: user.id,
            role: 'admin'
        }, { onConflict: 'user_id,role' });

    if (dbError) {
        console.error('Error setting role:', dbError);
    } else {
        console.log('Success! User is now an admin.');
    }
}

makeAdmin();
