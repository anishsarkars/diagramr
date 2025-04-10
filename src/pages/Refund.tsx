import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const Refund = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          <div className="bg-card rounded-lg shadow-sm border border-border/50 p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2">Return & Refund Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: 09/04/2025</p>

            <div className="space-y-6">
              <p>Thank you for shopping at <strong>Diagramr</strong>.</p>
              <p>The following terms are applicable for any products that you have purchased from us.</p>

              <div>
                <h2 className="text-xl font-semibold mt-8 mb-3">Eligibility for Refunds</h2>
                <p>We offer refunds under the following circumstances:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>If the service is not delivered as promised due to an error on our end.</li>
                  <li>If a technical issue caused by our platform prevents you from accessing the features you paid for, and the issue cannot be resolved within a reasonable timeframe.</li>
                  <li>If you cancel your subscription within the refund period outlined below.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mt-8 mb-3">Refund Period</h2>
                <p>Refund requests must be made within <strong>15</strong> days of the payment date. Requests made after this period will not be eligible for a refund.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mt-8 mb-3">Non-Refundable Cases</h2>
                <p>Refunds will not be granted under the following conditions:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>If you change your mind after purchasing a subscription or service.</li>
                  <li>If you fail to use the service during the subscription period.</li>
                  <li>If the issue is caused by third-party software or tools not affiliated with our platform.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mt-8 mb-3">Refund Process</h2>
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Contact our support team at <a href="mailto:contact@anishsarkar.site" className="text-primary hover:underline">contact@anishsarkar.site</a>.</li>
                  <li>Provide your payment receipt, order ID, and a detailed explanation of the issue.</li>
                  <li>Our team will review your request and respond within 3-5 business days.</li>
                  <li>If your request is approved, the refund will be processed to your original payment method within 7-10 business days.</li>
                </ol>
              </div>

              <div>
                <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
                <p>If you have any questions about this Refund Policy or require assistance, please reach out to us:</p>
                <p>Email: <a href="mailto:contact@anishsarkar.site" className="text-primary hover:underline">contact@anishsarkar.site</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Refund; 