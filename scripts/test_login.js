
import { createClient } from '@supabase/supabase-js';

// Client context (Anon key) - mimicking the frontend
const supabaseUrl = 'https://rvoesicrakjogmdnlbmf.supabase.co';
const anonKey = 'sb_publishable_tKNUTDKJ-obWZD8kqG3-Mw_3AXAs8U0'; // Taken from .env

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
    const email = 'julianotd@gmail.com';
    const password = '123456';

    console.log(`Attempting login for ${email} with password ${password}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login Failed:', error.message);
        console.error('Status:', error.status);
    } else {
        console.log('Login Successful!');
        console.log('User ID:', data.user.id);
        console.log('Access Token:', data.session.access_token.slice(0, 20) + '...');
    }
}

testLogin();
