
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPassword() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('Usage: node scripts/reset_password.js <email> <new_password>');
        return;
    }

    console.log(`Resetting password for ${email}...`);

    // We need the User ID first to use updateUserById (more reliable for admin updates)
    // Or verify if we can use admin.updateUserById directly? No, we need ID.
    // Or we can use generateLink?
    // Actually admin.updateUserById is the way. 

    // 1. Get User ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.error('User not found');
        return;
    }

    // 2. Update Password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
    } else {
        console.log('Success! Password updated.');
    }
}

resetPassword();
