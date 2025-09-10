"use client";

import { useState } from "react";

import { CreditCard, Download, Calendar, DollarSign, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface BillingInfo {
  plan: string;
  nextBilling: string;
  amount: number;
  paymentMethod: {
    type: string;
    last4: string;
    expiry: string;
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

export function BillingSettings() {
  const [billingInfo] = useState<BillingInfo>({
    plan: "Pro Plan",
    nextBilling: "2024-02-15",
    amount: 29.99,
    paymentMethod: {
      type: "Visa",
      last4: "4242",
      expiry: "12/27",
    },
  });

  const [invoices] = useState<Invoice[]>([
    {
      id: "INV-001",
      date: "2024-01-15",
      amount: 29.99,
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-002",
      date: "2023-12-15",
      amount: 29.99,
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-003",
      date: "2023-11-15",
      amount: 29.99,
      status: "Paid",
      description: "Pro Plan - Monthly",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePlanChange = async (newPlan: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Handle plan change
  };

  const handlePaymentMethodUpdate = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Handle payment method update
  };

  const downloadInvoice = (invoiceId: string) => {
    // Simulate invoice download
    console.log(`Downloading invoice ${invoiceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-700" />
            <CardTitle>Current Plan</CardTitle>
          </div>
          <CardDescription>Manage your subscription and billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 p-4">
            <div>
              <h3 className="text-neutral-900 font-medium">{billingInfo.plan}</h3>
              <p className="text-neutral-600 text-sm">
                Next billing: {new Date(billingInfo.nextBilling).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-neutral-900 text-2xl font-bold">${billingInfo.amount}</p>
              <p className="text-neutral-600 text-sm">per month</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-select">Change Plan</Label>
            <Select defaultValue="pro">
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Plan - $0/month</SelectItem>
                <SelectItem value="pro">Pro Plan - $29.99/month</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan - $99.99/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handlePlanChange("pro")} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-700" />
            <CardTitle>Payment Method</CardTitle>
          </div>
          <CardDescription>Update your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-[var(--radius-card)] border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-10 items-center justify-center rounded-[var(--radius-button)] bg-neutral-100 text-sm font-medium text-neutral-900">
                {billingInfo.paymentMethod.type}
              </div>
              <div>
                <p className="text-neutral-900 font-medium">•••• •••• •••• {billingInfo.paymentMethod.last4}</p>
                <p className="text-neutral-600 text-sm">Expires {billingInfo.paymentMethod.expiry}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handlePaymentMethodUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" disabled={isLoading} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-700" />
            <CardTitle>Billing History</CardTitle>
          </div>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <div key={invoice.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-neutral-900 font-medium">{invoice.description}</p>
                      <p className="text-neutral-600 text-sm">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                      <p className="text-neutral-900 font-medium">${invoice.amount}</p>
                      <div className="flex items-center justify-end gap-1">
                        <div
                          className={`inline-flex items-center rounded-[var(--radius-button)] px-2 py-1 text-xs font-medium ${
                            invoice.status === "Paid"
                              ? "bg-success-100 text-success-800"
                              : "bg-warning-100 text-warning-800"
                          }`}
                        >
                          {invoice.status}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < invoices.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-700" />
            <CardTitle>Usage & Limits</CardTitle>
          </div>
          <CardDescription>Monitor your current usage and plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-900 text-sm font-medium">API Calls</span>
              <span className="text-neutral-600 text-sm">8,250 / 10,000</span>
            </div>
            <div className="h-2 w-full rounded-[var(--radius-pill)] bg-neutral-200">
              <div className="h-2 rounded-[var(--radius-pill)] bg-primary-500" style={{ width: "82.5%" }}></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-900 text-sm font-medium">Storage</span>
              <span className="text-neutral-600 text-sm">1.2 GB / 5 GB</span>
            </div>
            <div className="h-2 w-full rounded-[var(--radius-pill)] bg-neutral-200">
              <div className="h-2 rounded-[var(--radius-pill)] bg-primary-500" style={{ width: "24%" }}></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-900 text-sm font-medium">Team Members</span>
              <span className="text-neutral-600 text-sm">3 / 5</span>
            </div>
            <div className="h-2 w-full rounded-[var(--radius-pill)] bg-neutral-200">
              <div className="h-2 rounded-[var(--radius-pill)] bg-primary-500" style={{ width: "60%" }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
