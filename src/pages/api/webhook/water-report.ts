import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.email || !data.zip) {
      return new Response(JSON.stringify({ error: 'Email and ZIP required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare webhook payload
    const webhookPayload = {
      event: 'water_report_generated',
      timestamp: new Date().toISOString(),
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      zip: data.zip,
      city: data.city || '',
      contaminants: data.contaminants || [],
      riskScore: data.riskScore || 0,
      riskLevel: data.riskLevel || 'unknown',
      grade: data.grade || 'N/A',
      recommendedSystem: data.recommendedSystem || '',
      reportUrl: data.reportUrl || `https://raleighwatersolutions.com/water-report/${data.zip}`,
      source: 'water_report_form',
      utmSource: data.utmSource || '',
      utmMedium: data.utmMedium || '',
      utmCampaign: data.utmCampaign || ''
    };

    // Send to configured webhook
    const WEBHOOK_URL = import.meta.env.WATER_REPORT_WEBHOOK_URL;

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

    // Also log for debugging
    console.log('Water report webhook payload:', webhookPayload);

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
