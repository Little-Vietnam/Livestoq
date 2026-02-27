"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";
import { formatIdr } from "@/lib/utils";

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceIdr: number;
  bestValue?: boolean;
};

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    priceIdr: 50000,
  },
  {
    id: "standard",
    name: "Standard",
    credits: 25,
    priceIdr: 100000,
    bestValue: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 60,
    priceIdr: 200000,
  },
];

export default function CreditsPage() {
  const router = useRouter();
  const { isAuthenticated, credits, addCredits } = useAuth();
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    CREDIT_PACKAGES[1]?.id ?? CREDIT_PACKAGES[0]?.id
  );
  const [paymentMethod, setPaymentMethod] = useState<"card">("card");
  const [isPaying, setIsPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/credits");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Redirecting to login…</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const selectedPackage =
    CREDIT_PACKAGES.find((p) => p.id === selectedPackageId) ??
    CREDIT_PACKAGES[0];

  const handlePurchase = async () => {
    if (!selectedPackage || isPaying) return;
    setIsPaying(true);
    setSuccessMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    addCredits(selectedPackage.credits);
    setIsPaying(false);
    setSuccessMessage(
      `Successfully added ${selectedPackage.credits} credits to your account.`
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Purchase Credits
          </h1>
          <p className="text-gray-600 text-sm">
            Each scan costs <span className="font-semibold">1 credit</span>.
            Buy credits in Indonesian Rupiah (IDR) and they will be stored on
            your account.
          </p>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current balance</p>
            <p className="text-2xl font-bold text-primary-700">{credits}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`relative text-left rounded-2xl border p-4 transition-all ${
                selectedPackageId === pkg.id
                  ? "border-primary-600 bg-primary-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-primary-300"
              }`}
            >
              {pkg.bestValue && (
                <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Best Value
                </span>
              )}
              <p className="text-xs font-semibold text-gray-500 mb-1">
                {pkg.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {pkg.credits}{" "}
                <span className="text-sm font-medium text-gray-500">
                  credits
                </span>
              </p>
              <p className="text-sm font-semibold text-primary-700 mb-1">
                {formatIdr(pkg.priceIdr)}
              </p>
              <p className="text-xs text-gray-500">
                Approx. {formatIdr(Math.round(pkg.priceIdr / pkg.credits))} per
                scan
              </p>
            </button>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Payment method
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    Card Payment (Mock)
                  </span>
                  <span className="text-xs text-gray-600">
                    Use a simulated card payment to complete your purchase.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {formatIdr(selectedPackage.priceIdr)}
              </p>
              <p className="text-xs text-gray-500">
                {selectedPackage.credits} credits
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            disabled={isPaying}
            className="w-full px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPaying
              ? "Processing card payment..."
              : "Pay with Card (Mock Payment)"}
          </button>

          {successMessage && (
            <div className="mt-2 rounded-lg bg-green-50 px-4 py-3 text-xs text-green-700 border border-green-200">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}

