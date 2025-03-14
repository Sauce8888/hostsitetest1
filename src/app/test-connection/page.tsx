"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export default function TestConnectionPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "success" | "error">("loading");
  const [stripeStatus, setStripeStatus] = useState<"loading" | "success" | "error">("loading");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const testSupabaseConnection = async () => {
    try {
      // Test query to check if Supabase is connected
      const { data, error } = await supabase.from("bookings").select("count").limit(1);
      
      if (error) {
        throw error;
      }
      
      setSupabaseStatus("success");
    } catch (error: any) {
      console.error("Supabase connection error:", error);
      setSupabaseStatus("error");
      setSupabaseError(error.message || "Unknown error connecting to Supabase");
    }
  };

  const testStripeConnection = async () => {
    try {
      // Make a simple call to the backend to test Stripe connection
      const response = await fetch("/api/test-stripe", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error connecting to Stripe");
      }
      
      setStripeStatus("success");
    } catch (error: any) {
      console.error("Stripe connection error:", error);
      setStripeStatus("error");
      setStripeError(error.message || "Unknown error connecting to Stripe");
    }
  };

  // Run tests on component mount
  useState(() => {
    testSupabaseConnection();
    testStripeConnection();
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Connection Test */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
          
          <div className="mb-4">
            Status: {' '}
            {supabaseStatus === "loading" && <span className="text-yellow-500">Checking...</span>}
            {supabaseStatus === "success" && <span className="text-green-600">Connected ✓</span>}
            {supabaseStatus === "error" && <span className="text-red-600">Connection Failed ✗</span>}
          </div>
          
          {supabaseStatus === "error" && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
              <p className="font-semibold">Error:</p>
              <p>{supabaseError}</p>
            </div>
          )}
          
          <button
            onClick={testSupabaseConnection}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            tabIndex={0}
            aria-label="Retry Supabase connection test"
          >
            Retry Test
          </button>
        </div>
        
        {/* Stripe Connection Test */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Stripe Connection</h2>
          
          <div className="mb-4">
            Status: {' '}
            {stripeStatus === "loading" && <span className="text-yellow-500">Checking...</span>}
            {stripeStatus === "success" && <span className="text-green-600">Connected ✓</span>}
            {stripeStatus === "error" && <span className="text-red-600">Connection Failed ✗</span>}
          </div>
          
          {stripeStatus === "error" && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
              <p className="font-semibold">Error:</p>
              <p>{stripeError}</p>
            </div>
          )}
          
          <button
            onClick={testStripeConnection}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            tabIndex={0}
            aria-label="Retry Stripe connection test"
          >
            Retry Test
          </button>
        </div>
      </div>
    </div>
  );
} 