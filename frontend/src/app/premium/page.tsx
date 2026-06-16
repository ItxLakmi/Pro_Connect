"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, Zap, Star, Shield, ArrowRight, X, Lock } from "lucide-react";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    payhere: any;
  }
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  active: boolean;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: string;
  endDate: string;
  plan: SubscriptionPlan;
}

const DEMO_PLANS: SubscriptionPlan[] = [
  {
    id: "demo-free",
    name: "FREE",
    price: 0,
    billingCycle: "MONTHLY",
    features: [
      "Basic profile",
      "Up to 10 job applications/month",
      "Standard search",
      "Community access",
      "Basic messaging",
    ],
    active: true,
  },
  {
    id: "demo-premium",
    name: "PREMIUM",
    price: 3500,
    billingCycle: "MONTHLY",
    features: [
      "Unlimited job applications",
      "Profile boost & priority listing",
      "InMail messages",
      "Premium badge on profile",
      "Analytics & insights dashboard",
      "Priority support",
    ],
    active: true,
  },
  {
    id: "demo-recruiter",
    name: "RECRUITER_PRO",
    price: 9500,
    billingCycle: "MONTHLY",
    features: [
      "Post unlimited jobs",
      "Advanced candidate search & filters",
      "Applicant tracking system",
      "Bulk messaging to candidates",
      "Team collaboration tools",
      "Priority job listing",
    ],
    active: true,
  },
];

function formatPlanName(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PlanCard = ({
  plan,
  isCurrent,
  onSubscribe,
  onCancel,
  index,
  hasActiveSub,
}: {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onCancel: (plan: SubscriptionPlan) => void;
  index: number;
  hasActiveSub?: boolean;
}) => {
  const isFree = plan.name === "FREE";
  const isPremium = plan.name === "PREMIUM";
  const isRecruiter = plan.name === "RECRUITER_PRO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      style={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: isPremium
          ? "0 20px 60px rgba(251, 191, 36, 0.25), 0 4px 20px rgba(0,0,0,0.15)"
          : isRecruiter
          ? "0 20px 60px rgba(124, 58, 237, 0.2), 0 4px 20px rgba(0,0,0,0.12)"
          : "0 4px 20px rgba(0,0,0,0.08)",
        border: isPremium
          ? "2px solid rgba(251, 191, 36, 0.6)"
          : isRecruiter
          ? "2px solid rgba(124, 58, 237, 0.4)"
          : "1.5px solid #e5e7eb",
        background: isFree ? "#ffffff" : "#0f0f1a",
        flex: 1,
        minWidth: "280px",
        maxWidth: "360px",
        transform: isPremium ? "scale(1.02)" : undefined,
      }}
    >
      {isPremium && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.04) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
      {isRecruiter && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(91,33,182,0.04) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {isPremium && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#fff",
            borderRadius: "9999px",
            padding: "4px 14px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            zIndex: 1,
          }}
        >
          MOST POPULAR
        </div>
      )}

      <div style={{ padding: "32px" }}>
        {/* Plan icon and name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isFree
                ? "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
                : isPremium
                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                : "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: isPremium
                ? "0 8px 24px rgba(251,191,36,0.4)"
                : isRecruiter
                ? "0 8px 24px rgba(124,58,237,0.4)"
                : undefined,
            }}
          >
            {isFree && <Shield size={24} style={{ color: "#6B7280" }} />}
            {isPremium && <Crown size={24} style={{ color: "#fff" }} fill="white" />}
            {isRecruiter && <Zap size={24} style={{ color: "#fff" }} fill="white" />}
          </div>
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: isFree ? "#111827" : "#f9fafb",
              }}
            >
              {formatPlanName(plan.name)}
            </div>
            <div style={{ fontSize: "12px", color: isFree ? "#9CA3AF" : "#6B7280", marginTop: "2px" }}>
              {plan.billingCycle === "MONTHLY" ? "Billed monthly" : "Billed yearly"}
            </div>
          </div>
        </div>

        {/* Price */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
            <span
              style={{
                fontSize: "44px",
                fontWeight: 800,
                lineHeight: 1,
                color: isFree ? "#111827" : isPremium ? "#FCD34D" : "#C4B5FD",
              }}
            >
              {plan.price === 0 ? "Free" : `Rs ${plan.price}`}
            </span>
            {plan.price > 0 && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#9CA3AF",
                  paddingBottom: "8px",
                }}
              >
                /month
              </span>
            )}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {plan.features.map((feature, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isFree
                    ? "#f3f4f6"
                    : isPremium
                    ? "rgba(251,191,36,0.2)"
                    : "rgba(124,58,237,0.2)",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                <Check
                  size={11}
                  style={{
                    color: isFree ? "#6B7280" : isPremium ? "#F59E0B" : "#7C3AED",
                    strokeWidth: 3,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: isFree ? "#374151" : "#D1D5DB",
                  lineHeight: "1.4",
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {isCurrent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  textAlign: "center",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1.5px solid rgba(34,197,94,0.3)",
                  color: "#16a34a",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Check size={16} style={{ strokeWidth: 3 }} /> Current Plan
              </div>
              <button
                onClick={() => onCancel(plan)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  padding: "10px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Cancel Plan
              </button>
            </div>
        ) : isFree && !hasActiveSub ? (
          <div
            style={{
              textAlign: "center",
              padding: "14px",
              borderRadius: "12px",
              background: "#f9fafb",
              border: "1.5px solid #e5e7eb",
              color: "#9CA3AF",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Your current plan
          </div>
        ) : isFree && hasActiveSub ? (
          <div
            style={{
              textAlign: "center",
              padding: "14px",
              borderRadius: "12px",
              background: "#f9fafb",
              border: "1.5px solid #e5e7eb",
              color: "#9CA3AF",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Basic Plan
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubscribe(plan)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: isPremium
                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                : "linear-gradient(135deg, #7C3AED, #5B21B6)",
              color: "#fff",
              boxShadow: isPremium
                ? "0 8px 24px rgba(251,191,36,0.35)"
                : "0 8px 24px rgba(124,58,237,0.35)",
            }}
          >
            {isPremium ? <Crown size={16} fill="white" style={{ color: "white" }} /> : <Zap size={16} fill="white" style={{ color: "white" }} />}
            Activate Plan
            <ArrowRight size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default function PremiumPage() {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.allSettled([
        api.get("/monetization/plans"),
        api.get("/monetization/subscriptions"),
      ]);

      if (plansRes.status === "fulfilled" && plansRes.value.data.length > 0) {
        const apiPlans: SubscriptionPlan[] = plansRes.value.data;
        const hasFree = apiPlans.some((p) => p.name === "FREE");
        setPlans(hasFree ? apiPlans : [DEMO_PLANS[0], ...apiPlans]);
      } else {
        setPlans(DEMO_PLANS);
      }

      if (subsRes.status === "fulfilled") {
        setSubscriptions(subsRes.value.data);
      }
    } catch {
      setPlans(DEMO_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;
    setSubscribing(true);
    setError(null);

    const orderId = `plan_${selectedPlan.id}_${Date.now()}`;
    const amount = selectedPlan.price;
    const currency = "LKR";

    // DEV BYPASS: Force success without PayHere if amount is 0 or user holds 'Shift' key
    // Uncomment or use this if PayHere Sandbox is completely unresponsive
    const handleDevSuccess = async () => {
      try {
        await api.post("/monetization/subscribe", { planId: selectedPlan.id });
        updateUser({ isPremium: true });
        setSuccessPlan(selectedPlan.name);
        setSubscriptions((prev) => [
          ...prev.filter((s) => s.planId !== selectedPlan.id),
          {
            id: "new-" + Date.now(),
            planId: selectedPlan.id,
            status: "ACTIVE",
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            plan: selectedPlan,
            createdAt: new Date().toISOString(),
            user: user,
          },
        ]);
      } finally {
        setSubscribing(false);
      }
    };

    // If holding SHIFT key while clicking Subscribe, skip PayHere (Developer Tool)
    if (window.event && (window.event as MouseEvent).shiftKey) {
      await handleDevSuccess();
      return;
    }

    try {
      // 1. Get secure hash from backend
      const hashRes = await api.post("/monetization/payhere-hash", {
        orderId,
        amount,
        currency,
      });

      const { hash, merchantId, amountFormatted } = hashRes.data;

      if (!window.payhere) {
        throw new Error("PayHere script is not loaded. Please disable ad-blockers or try refreshing the page.");
      }

      // 2. PayHere Payment Object Configuration
      const payment = {
        sandbox: true,
        merchant_id: merchantId,
        return_url: window.location.href,
        cancel_url: window.location.href,
        // Webhook URL must be accessible by PayHere (use Ngrok for local testing)
        notify_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://proconnect-api.itxdigital.com'}/api/monetization/notify`,
        order_id: orderId,
        items: selectedPlan.name + " Subscription",
        amount: amountFormatted, // Crucial: Must be string with 2 decimal places to match hash
        currency: currency,
        hash: hash,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: "0771234567",
        address: "No.1, Galle Road",
        city: "Colombo",
        country: "Sri Lanka",
        custom_1: user.id, // User ID for the webhook
        custom_2: selectedPlan.id, // Plan ID for the webhook
      };

    // PayHere Callbacks
    window.payhere.onCompleted = async function onCompleted() {
      try {
        // The backend webhook (/monetization/notify) securely activates the subscription.
        // We will optimistically update the UI here.
        updateUser({ isPremium: true }); 
        setSuccessPlan(selectedPlan.name);
        setSubscriptions((prev) => [
          ...prev.filter((s) => s.planId !== selectedPlan.id),
          {
            id: "new-" + Date.now(),
            planId: selectedPlan.id,
            status: "ACTIVE",
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            plan: selectedPlan,
            createdAt: new Date().toISOString(),
            user: user,
          },
        ]);
      } catch (err: unknown) {
        setError("Error rendering success state.");
      } finally {
        setSubscribing(false);
        setSelectedPlan(null);
      }
    };

    window.payhere.onDismissed = function onDismissed() {
      setSubscribing(false);
      setSelectedPlan(null);
    };

    window.payhere.onError = function onError(errorMsg: string) {
      setError("Payment failed: " + errorMsg);
      setSubscribing(false);
      setSelectedPlan(null);
    };

    // Trigger PayHere
    window.payhere.startPayment(payment);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to initialize payment gateway. Please try again.");
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelPlan = async (plan: SubscriptionPlan) => {
    if (!confirm("Are you sure you want to cancel your " + plan.name + " plan? You will lose premium features immediately.")) {
      return;
    }
    
    // Find active subscription ID for this plan
    const activeSub = subscriptions.find(s => s.planId === plan.id && s.status === "ACTIVE");
    if (!activeSub) return;

    try {
      await api.post(`/monetization/subscriptions/${activeSub.id}/cancel`);
      updateUser({ isPremium: false });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === activeSub.id ? { ...s, status: "CANCELED" } : s))
      );
      alert("Plan cancelled successfully.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e?.response?.data?.message || "Failed to cancel plan.");
    }
  };

  const isCurrentPlan = (planId: string) =>
    subscriptions.some((s) => s.planId === planId && s.status === "ACTIVE");

  const activeSub = subscriptions.find((s) => s.status === "ACTIVE");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0a14 0%, #0f0c29 40%, #0a0a14 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="afterInteractive" />
      <Navbar />

      {/* Hero Section */}
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(251,191,36,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "15%",
            width: "280px",
            height: "280px",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "15%",
            width: "280px",
            height: "280px",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Crown icon */}
          <motion.div
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              boxShadow:
                "0 20px 60px rgba(251,191,36,0.4), 0 0 0 1px rgba(251,191,36,0.2)",
              marginBottom: "24px",
            }}
          >
            <Crown size={40} fill="white" style={{ color: "white" }} />
          </motion.div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "16px",
              background:
                "linear-gradient(135deg, #ffffff 0%, #FCD34D 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Unlock Your Full Potential
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#9CA3AF",
              maxWidth: "520px",
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Join thousands of professionals who supercharged their career with
            ProConnect Premium.
          </p>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: "inline-flex",
              gap: "32px",
              padding: "16px 32px",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { label: "Active Members", value: "50K+" },
              { label: "Jobs Landed", value: "12K+" },
              { label: "Avg Salary Boost", value: "32%" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#FCD34D",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Active subscription banner */}
      <AnimatePresence>
        {activeSub && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ maxWidth: "1100px", margin: "0 auto 32px", padding: "0 24px" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "14px",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Star
                size={20}
                style={{ color: "#16a34a", fill: "currentColor", flexShrink: 0 }}
              />
              <div>
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "14px" }}>
                  You&apos;re on the {formatPlanName(activeSub.plan.name)} plan
                </span>
                <span
                  style={{ color: "#6B7280", fontSize: "13px", marginLeft: "8px" }}
                >
                  Active until{" "}
                  {new Date(activeSub.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {successPlan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: "1100px", margin: "0 auto 24px", padding: "0 24px" }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.1))",
                border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: "14px",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Crown
                  size={20}
                  style={{ color: "#F59E0B", fill: "currentColor" }}
                />
                <span style={{ color: "#FCD34D", fontWeight: 700, fontSize: "14px" }}>
                  🎉 Welcome to {formatPlanName(successPlan)}! Your plan is now
                  active.
                </span>
              </div>
              <button
                onClick={() => setSuccessPlan(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Section */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "3px solid rgba(251,191,36,0.3)",
                borderTopColor: "#F59E0B",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#6B7280", fontSize: "14px" }}>Loading plans...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "24px",
              justifyContent: "center",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={isCurrentPlan(plan.id)}
                onSubscribe={() => setSelectedPlan(plan)}
                onCancel={handleCancelPlan}
                index={i}
                hasActiveSub={!!activeSub}
              />
            ))}
          </div>
        )}

        {/* Why Premium section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: "80px", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#f9fafb",
              marginBottom: "8px",
            }}
          >
            Why ProConnect Premium?
          </h2>
          <p style={{ color: "#6B7280", fontSize: "15px", marginBottom: "40px" }}>
            Everything you need to accelerate your professional growth
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {[
              {
                icon: <Crown size={22} fill="currentColor" />,
                color: "#F59E0B",
                title: "Premium Badge",
                desc: "Stand out with a gold badge on your profile",
              },
              {
                icon: <Zap size={22} fill="currentColor" />,
                color: "#7C3AED",
                title: "Profile Boost",
                desc: "Get 5x more profile views from recruiters",
              },
              {
                icon: <Star size={22} fill="currentColor" />,
                color: "#EC4899",
                title: "Priority Listings",
                desc: "Your profile appears first in search results",
              },
              {
                icon: <Shield size={22} />,
                color: "#10B981",
                title: "Priority Support",
                desc: "24/7 dedicated customer support access",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${item.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#f9fafb",
                    marginBottom: "6px",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPlan(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: "#0f0f1a",
                border: "1.5px solid rgba(251,191,36,0.3)",
                borderRadius: "24px",
                padding: "40px",
                maxWidth: "440px",
                width: "100%",
                position: "relative",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1)",
              }}
            >
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
              >
                <X size={16} />
              </button>

              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                    background:
                      selectedPlan.name === "PREMIUM"
                        ? "linear-gradient(135deg, #F59E0B, #D97706)"
                        : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow:
                      selectedPlan.name === "PREMIUM"
                        ? "0 12px 32px rgba(251,191,36,0.35)"
                        : "0 12px 32px rgba(124,58,237,0.35)",
                  }}
                >
                  {selectedPlan.name === "PREMIUM" ? (
                    <Crown size={30} fill="white" style={{ color: "white" }} />
                  ) : (
                    <Zap size={30} fill="white" style={{ color: "white" }} />
                  )}
                </div>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#f9fafb",
                    marginBottom: "8px",
                  }}
                >
                  Activate {formatPlanName(selectedPlan.name)}
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "14px", lineHeight: 1.5 }}>
                  You&apos;re about to activate the{" "}
                  <strong
                    style={{
                      color:
                        selectedPlan.name === "PREMIUM" ? "#FCD34D" : "#C4B5FD",
                    }}
                  >
                    {formatPlanName(selectedPlan.name)} plan
                  </strong>{" "}
                  for{" "}
                  <strong style={{ color: "#f9fafb" }}>
                    ${selectedPlan.price}/month
                  </strong>
                  . This is a demo — no real payment will be charged.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "16px",
                    color: "#FCA5A5",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setSelectedPlan(null)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#9CA3AF",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: subscribing ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background:
                      selectedPlan.name === "PREMIUM"
                        ? "linear-gradient(135deg, #F59E0B, #D97706)"
                        : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                    color: "#fff",
                    opacity: subscribing ? 0.7 : 1,
                    boxShadow: "0 8px 24px rgba(251,191,36,0.25)",
                  }}
                >
                  {subscribing ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Crown size={16} fill="white" style={{ color: "white" }} />
                      Confirm &amp; Activate
                    </>
                  )}
                </motion.button>
              </div>

              <p
                style={{
                  textAlign: "center",
                  marginTop: "16px",
                  fontSize: "11px",
                  color: "#4B5563",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <Lock size={10} />
                Demo only — no payment required
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
