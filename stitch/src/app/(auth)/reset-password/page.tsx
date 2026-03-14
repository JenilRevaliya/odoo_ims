"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto">
          <Package className="w-6 h-6 text-indigo-600" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Reset link sent to email (mock)'); }}>
          <div>
            <input
              type="email"
              required
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
              placeholder="admin@coreinventory.com"
            />
          </div>
          
          <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
            Send Reset Link
          </Button>
        </form>

        <div className="text-sm text-gray-500">
          Remember your password? <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
