
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const WEBHOOK_SECRET = Deno.env.get("DODO_PAYMENTS_WEBHOOK_SECRET") || "whsec_iWelQsqfcqDcGWLwTDmxibEz";
const API_KEY = Deno.env.get("DODO_PAYMENTS_API_KEY") || "kHV4kNcbfWYnJGk6.ua4E-o_qZARBouF9ZwgAHvaTDokhUQbayBFp1jiXfattb3Y0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Get headers for webhook verification
    const signature = req.headers.get("dodo-signature");
    
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response(
        JSON.stringify({ error: "Missing required webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the raw request body
    const rawBody = await req.text();
    
    // Verify signature (this is a simplified example; in production, use proper HMAC verification)
    // In a real implementation, you'd verify the webhook signature with the secret
    // Sample verification code would be:
    // const isValid = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
    // if (!isValid) {...}
    
    // Parse the webhook body
    const body = JSON.parse(rawBody);
    console.log("Webhook body:", body);
    
    // Check for required fields
    if (!body.event || !body.data) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process different webhook events
    switch (body.event) {
      case "payment.succeeded":
        await handleSuccessfulPayment(body.data);
        break;
      case "payment.failed":
        await handleFailedPayment(body.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${body.event}`);
    }
    
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleSuccessfulPayment(paymentData: any) {
  console.log("Processing successful payment:", paymentData);
  
  try {
    // Extract customer information
    const { id, customer_email, customer_id, metadata } = paymentData;
    
    // If metadata contains a user ID, update their premium status
    if (metadata && metadata.user_id) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", metadata.user_id);
      
      if (error) {
        console.error("Error updating user premium status:", error);
        throw error;
      }
      
      console.log(`Updated premium status for user ${metadata.user_id}`);
    } 
    // If no user ID in metadata, try to find user by email
    else if (customer_email) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error("Error fetching users:", userError);
        throw userError;
      }
      
      // Find user with matching email
      const user = userData.users.find(u => u.email === customer_email);
      
      if (user) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", user.id);
        
        if (error) {
          console.error("Error updating user premium status:", error);
          throw error;
        }
        
        console.log(`Updated premium status for user ${user.id} with email ${customer_email}`);
      } else {
        console.log(`No user found with email ${customer_email}`);
      }
    } else {
      console.log("No user identifier found in payment data");
    }
    
    // Record the payment in your database
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        payment_id: id,
        customer_email,
        customer_id,
        status: "succeeded",
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.payment_method_type,
        metadata: paymentData.metadata
      });
    
    if (paymentError) {
      console.error("Error recording payment:", paymentError);
    }
    
  } catch (error) {
    console.error("Error in handleSuccessfulPayment:", error);
    throw error;
  }
}

async function handleFailedPayment(paymentData: any) {
  console.log("Processing failed payment:", paymentData);
  
  try {
    // Record the failed payment
    const { error } = await supabaseAdmin
      .from("payments")
      .insert({
        payment_id: paymentData.id,
        customer_email: paymentData.customer_email,
        customer_id: paymentData.customer_id,
        status: "failed",
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.payment_method_type,
        metadata: paymentData.metadata,
        error_message: paymentData.failure_reason
      });
    
    if (error) {
      console.error("Error recording failed payment:", error);
    }
  } catch (error) {
    console.error("Error in handleFailedPayment:", error);
    throw error;
  }
}

// Create a Supabase admin client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseAdmin = createClient(
  // These environment variables are set automatically by Supabase Edge Functions
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
