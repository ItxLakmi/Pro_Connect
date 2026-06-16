import React from 'react';
import { Shield, Lock, FileText, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-blue-600 p-8 md:p-12 text-center">
          <Shield className="w-16 h-16 text-blue-100 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-blue-100 mt-2 text-lg">Committed to protecting your data and privacy (GDPR & CCPA Compliant)</p>
          <p className="text-blue-200 mt-1 text-sm">Last updated: May 30, 2026</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
          
          <section className="flex gap-6">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, including your name, email address, profile information, payment details, and any content you post on ProConnect.</p>
              <p>We automatically collect certain information when you use our services, including device data, IP addresses, and browsing actions.</p>
            </div>
          </section>

          <section className="flex gap-6">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Secure Your Data</h2>
              <p className="mb-3">All user passwords are securely hashed using bcrypt encryption. Sensitive payment information is processed through PCI DSS compliant third-party gateways (e.g., Stripe) and is never stored on our servers.</p>
              <p>We implement role-based access control (RBAC) to ensure that only authorized personnel and users can access specific platform features and data.</p>
            </div>
          </section>

          <section className="flex gap-6">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Your Rights (GDPR & CCPA)</h2>
              <p className="mb-3">Under data protection laws, you have specific rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Right to Access:</strong> You can request a copy of the data we hold about you.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request that we delete all your personal data.</li>
                <li><strong>Right to Rectification:</strong> You can correct inaccurate data.</li>
                <li><strong>Right to Data Portability:</strong> You can request to export your data in a machine-readable format.</li>
              </ul>
              <p>To exercise any of these rights, please contact our Data Protection Officer at privacy@proconnect.com.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
