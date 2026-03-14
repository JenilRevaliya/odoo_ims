"use client";

import { useSession } from "next-auth/react";
import { User, Shield, KeyRound, Bell } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs text-gray-500">Settings / General</p>
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and system preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl flex items-center justify-center">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Setting Groups */}
        <div className="divide-y divide-gray-100">
          <div className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Role & Access</h3>
              <p className="text-sm text-gray-500 mt-1">
                You are currently logged in with <span className="font-bold text-gray-700 capitalize">{session?.user?.role}</span> privileges. 
                {session?.user?.role === "manager" 
                  ? " You have full access to all warehouses and system settings." 
                  : " You have restricted access to your assigned warehouses."}
              </p>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
            <KeyRound className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Password</h3>
              <p className="text-sm text-gray-500 mt-1">Change your current password or set up 2FA.</p>
              <button className="mt-3 text-sm font-medium text-indigo-600 hover:underline">Reset Password</button>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
            <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">Receive email alerts for low stock and pending receipts.</p>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" className="form-checkbox rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span className="text-sm text-gray-700">Enable email notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
