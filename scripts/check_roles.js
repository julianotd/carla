
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2b2VzaWNyYWtqb2dtZG5sYm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDQxMSwiZXhwIjoyMDg2MzQ2NDExfQ.kr4uDuqiazCh-31FLlfqy003RjJx0X8LRspffz562MU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkRoles() {
    console.log("Checking user_roles table...");

    // allow filtering by email if provided
    const email = process.argv[2];

    let query = supabase.from("user_roles").select("*");

    if (email) {
        // First get user ID
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            console.error("Auth Error:", authError);
            return;
        }
        const user = users.find(u => u.email === email);
        if (user) {
            console.log(`User found: ${user.id}`);
            query = query.eq('user_id', user.id);
        } else {
            console.log("User not found in Auth");
            return;
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching roles:", error);
    } else {
        console.log("Roles found:", data.length);
        console.table(data);
    }
}

checkRoles();
