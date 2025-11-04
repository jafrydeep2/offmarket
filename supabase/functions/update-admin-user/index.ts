// Supabase Edge Function: update-admin-user
// Updates a user account with admin privileges using service role

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface RequestBody {
  userId: string;
  email?: string;
  password?: string;
  username?: string;
  subscriptionType?: 'basic' | 'premium';
  subscriptionExpiry?: string;
  isActive?: boolean;
  isAdmin?: boolean;
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
    if (!body.userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Update auth user if email or password is provided
    if (body.email || body.password) {
      const updateData: any = {};
      
      if (body.email) {
        updateData.email = body.email;
      }
      
      if (body.password) {
        if (body.password.length < 6) {
          return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        updateData.password = body.password;
      }

      // Update auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        body.userId,
        updateData
      );

      if (authError) {
        console.error('Error updating auth user:', authError);
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

    }

    // If account is being set to active, confirm email (regardless of whether email was changed)
    if (body.isActive !== undefined && body.isActive) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(body.userId, {
        email_confirm: true,
      });
      if (confirmError) {
        console.error('Error confirming email:', confirmError);
        // Don't fail the request if email confirmation fails, just log it
      }
    }

    // Update profile
    const profileUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.username !== undefined) {
      profileUpdateData.username = body.username || null;
    }
    if (body.subscriptionType !== undefined) {
      profileUpdateData.subscription_type = body.subscriptionType;
    }
    if (body.subscriptionExpiry !== undefined) {
      profileUpdateData.subscription_expiry = body.subscriptionExpiry;
    }
    if (body.isActive !== undefined) {
      profileUpdateData.is_active = body.isActive;
    }
    if (body.isAdmin !== undefined) {
      profileUpdateData.is_admin = body.isAdmin;
    }
    if (body.email !== undefined) {
      profileUpdateData.email = body.email;
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', body.userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User updated successfully',
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

