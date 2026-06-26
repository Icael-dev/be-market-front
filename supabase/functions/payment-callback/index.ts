import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentCallback {
  transaction_id: string;
  status: 'success' | 'failed' | 'pending';
  phone_number: string;
  amount: number;
  provider: 'tmoney' | 'flooz';
  reference: string;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const callback: PaymentCallback = await req.json();

    console.log('Payment callback received:', callback);

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, order:orders(*)')
      .eq('reference', callback.reference)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', callback.reference);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newStatus = callback.status === 'success' ? 'paid' :
                      callback.status === 'failed' ? 'failed' : 'processing';

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        provider_response: callback,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', payment.id);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (newStatus === 'paid' && payment.order) {
      const newOrderStatus = payment.order.status === 'pending' ? 'confirmed' : payment.order.status;

      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: newOrderStatus
        })
        .eq('id', payment.order_id);

      console.log('Order updated:', payment.order_id, 'to status:', newOrderStatus);

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', payment.order_id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('decrement_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});