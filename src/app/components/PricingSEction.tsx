// components/PricingSection.tsx (New component for Pricing)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const pricingPlans = [
  {
    name: "Basic Editing",
    price: "$99",
    description: "Simple cuts and basic color correction",
    features: ["Up to 5 minutes", "1 revision", "Standard delivery"],
  },
  {
    name: "Pro Editing",
    price: "$299",
    description: "Full edit with effects and sound design",
    features: ["Up to 15 minutes", "3 revisions", "Priority delivery"],
  },
  {
    name: "Premium Package",
    price: "$599",
    description: "Complete production with motion graphics",
    features: ["Unlimited length", "Unlimited revisions", "Rush delivery"],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gray-900/50">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
          Pricing
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Flexible packages tailored to your video needs. Contact for custom
          quotes.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card
            key={plan.name}
            className="bg-gray-800/40 backdrop-blur-sm border-white/10"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                {plan.name}
              </CardTitle>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {plan.price}
              </div>
              <p className="text-gray-400">{plan.description}</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
              <Badge className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Most Popular
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
