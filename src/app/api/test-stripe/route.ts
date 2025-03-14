import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    // Try to fetch a simple resource from Stripe to verify the connection
    const balance = await stripe.balance.retrieve();
    
    return NextResponse.json({
      success: true,
      message: "Stripe connection successful",
      available: balance.available.map(item => ({
        amount: item.amount,
        currency: item.currency
      }))
    });
  } catch (error: any) {
    console.error("Stripe connection test failed:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to connect to Stripe" 
      },
      { status: 500 }
    );
  }
} 