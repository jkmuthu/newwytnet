import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function AdminPlansPrices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Plans & Prices</h1>
        <p className="text-muted-foreground">Manage subscription plans and pricing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pricing Management
          </CardTitle>
          <CardDescription>Configure subscription tiers and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Plans and pricing management interface coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
