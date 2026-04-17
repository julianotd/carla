
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function listUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id})`);
    });
}

listUsers();
