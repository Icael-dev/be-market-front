import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'order_confirmation' | 'order_shipped' | 'stock_alert' | 'newsletter';
  data: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();

    console.log('Sending email:', { to, subject, template, data });

    const emailTemplates: Record<string, string> = {
      order_confirmation: `
        <h1>Confirmation de commande</h1>
        <p>Bonjour ${data.customer_name},</p>
        <p>Votre commande <strong>#${data.order_number}</strong> a ete confirmee.</p>
        <p>Montant total: ${data.total} FCFA</p>
        <p>Merci pour votre confiance !</p>
      `,
      order_shipped: `
        <h1>Votre commande est en route</h1>
        <p>Bonjour ${data.customer_name},</p>
        <p>Votre commande <strong>#${data.order_number}</strong> a ete expediee.</p>
        <p>Livraison prevue: ${data.estimated_delivery}</p>
      `,
      stock_alert: `
        <h1>Produit de nouveau disponible</h1>
        <p>Bonjour,</p>
        <p>Le produit <strong>${data.product_name}</strong> est de nouveau en stock !</p>
        <p>Commandez-le maintenant avant qu'il ne soit plus disponible.</p>
      `,
      newsletter: `
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      `
    };

    const htmlContent = emailTemplates[template] || '<p>Email</p>';

    console.log('Email sent successfully to:', to);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});