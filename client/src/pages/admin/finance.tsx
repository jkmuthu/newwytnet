import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBillingPage from "./billing";
import AdminTransactions from "./transactions";

export default function AdminFinance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance</h1>
        <p className="text-muted-foreground">Manage billing, transactions, and financial operations</p>
      </div>
      
      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="billing">
          <AdminBillingPage />
        </TabsContent>
        
        <TabsContent value="transactions">
          <AdminTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
