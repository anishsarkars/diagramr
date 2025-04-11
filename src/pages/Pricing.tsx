import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { useAccess } from "@/components/access-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentSuccessNotification } from "@/components/payment-success-notification";

export default function Pricing() {
  const { user } = useAuth();
  const { isPremium } = useAccess();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [isLoading]);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Basic features for casual users",
      features: [
        "10 searches per day",
        "Basic diagram results",
        "Low resolution exports",
        "Standard support"
      ],
      highlightedFeatures: [],
      cta: {
        text: "Current Plan",
        onClick: () => {},
        variant: "outline" as const,
        disabled: true,
      },
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      billingPeriod: "one-time payment",
      description: "Advanced features for professionals",
      popular: true,
      features: [
        "Unlimited searches",
        "Access all diagram types",
        "High resolution exports",
        "Download in multiple formats",
        "Priority customer support",
        "Early access to new features"
      ],
      highlightedFeatures: [
        "Unlimited searches",
        "High resolution exports"
      ],
      cta: {
        text: isPremium ? "Current Plan" : "Upgrade",
        onClick: () => {
          if (isPremium) return;
          
          if (!user) {
            navigate("/auth", { state: { returnTo: "/pricing" } });
          } else {
            window.open("https://checkout.dodopayments.com/buy/pdt_Wx3ImdRPDky11pATGyLRa?quantity=1&redirect_url=https://diagramr.vercel.app", "_blank");
          }
        },
        variant: isPremium ? "outline" as const : "default" as const,
        disabled: isPremium,
      },
    }
  ];

  return (
    <div className="container relative py-12 md:py-24">
      <PaymentSuccessNotification />
      <div className="space-y-5 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Simple pricing for everyone
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          No hidden fees. Upgrade or downgrade at any time.
        </p>
      </div>
      
      <div className="mx-auto grid max-w-md gap-6 pt-10 sm:max-w-none md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(plan.popular ? "border-primary-foreground" : "border-border", "bg-background")}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">{plan.price}</div>
              {plan.billingPeriod && (
                <div className="text-sm text-muted-foreground">
                  {plan.billingPeriod}
                </div>
              )}
              <ul className="grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.highlightedFeatures.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Key Features</h4>
                  <ul className="grid gap-2">
                    {plan.highlightedFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 rounded-md border border-border bg-secondary p-2 text-sm"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.cta.variant}
                onClick={plan.cta.onClick}
                disabled={plan.cta.disabled}
                className="w-full"
                isLoading={isLoading}
              >
                {plan.cta.text}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
