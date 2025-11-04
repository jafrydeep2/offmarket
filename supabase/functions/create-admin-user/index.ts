// Supabase Edge Function: create-admin-user
// Creates a user account with admin privileges using service role

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface RequestBody {
  email: string;
  password: string;
  username?: string;
  subscriptionType: 'basic' | 'premium';
  subscriptionExpiry: string;
  isActive: boolean;
  isAdmin: boolean;
}

serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!url || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: RequestBody = await req.json();

    // Validation
    if (!body.email || !body.password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create auth user using admin API
    // If isActive is true, confirm email immediately
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: body.isActive, // Confirm email if account is active
      user_metadata: {
        username: body.username || null,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Wait a moment for the trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create or update profile
    const profileData = {
      id: authData.user.id,
      email: body.email,
      username: body.username || null,
      subscription_type: body.subscriptionType,
      subscription_expiry: body.subscriptionExpiry,
      is_active: body.isActive,
      is_admin: body.isAdmin,
      updated_at: new Date().toISOString(),
    };

    // Try to insert first, if it fails (profile exists), update instead
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);

    if (insertError) {
      // Profile might already exist from trigger, update it
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          username: body.username || null,
          subscription_type: body.subscriptionType,
          subscription_expiry: body.subscriptionExpiry,
          is_active: body.isActive,
          is_admin: body.isAdmin,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed_at: authData.user.email_confirmed_at,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

