// Supabase Edge Function: send-alert-emails
// Reads pending rows from email_queue and sends via Resend

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

interface QueueItem {
  id: string;
  to_email: string;
  subject: string;
  body_text?: string;
  body_html?: string;
}

serve(async (req: Request) => {
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    const brandFrom = Deno.env.get('ALERTS_FROM_EMAIL') || 'alerts@offmarket-psi.vercel.app';

    if (!url || !serviceRoleKey || !resendKey) {
      return new Response('Missing environment variables', { status: 500 });
    }

    const supabaseRes = await fetch(`${url}/rest/v1/email_queue?status=eq.pending&order=created_at.asc&limit=25`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
        Prefer: 'return=representation'
      }
    });

    if (!supabaseRes.ok) {
      const txt = await supabaseRes.text();
      return new Response(`Failed to fetch queue: ${txt}`, { status: 500 });
    }
    const items: QueueItem[] = await supabaseRes.json();

    for (const item of items) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: brandFrom,
            to: item.to_email,
            subject: item.subject,
            text: item.body_text,
            html: item.body_html
          })
        });

        if (!emailRes.ok) {
          const errTxt = await emailRes.text();
          await fetch(`${url}/rest/v1/email_queue?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'failed', last_error: errTxt })
          });
          continue;
        }

        await fetch(`${url}/rest/v1/email_queue?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString() })
        });
      } catch (err) {
        await fetch(`${url}/rest/v1/email_queue?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'failed', last_error: String(err) })
        });
      }
    }

    return new Response(JSON.stringify({ processed: items.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});


