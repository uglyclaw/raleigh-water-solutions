import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare webhook payload
    const webhookPayload = {
      event: 'contact_form_submitted',
      timestamp: new Date().toISOString(),
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      message: data.message || '',
      formType: data.formType || 'general',
      pageUrl: data.pageUrl || '',
      source: data.source || 'website',
      utmSource: data.utmSource || '',
      utmMedium: data.utmMedium || '',
      utmCampaign: data.utmCampaign || ''
    };

    // Send to configured webhook
    const WEBHOOK_URL = import.meta.env.CONTACT_FORM_WEBHOOK_URL;

    if (WEBHOOK_URL) {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        console.error('Webhook failed:', await response.text());
      }
    }

    // Log for debugging
    console.log('Contact webhook payload:', webhookPayload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
