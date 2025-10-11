import HubBuilder from "@/components/builders/hub-builder";

export default function AdminHubs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hub Builder</h1>
        <p className="text-muted-foreground">Create cross-tenant hubs and marketplaces</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border">
        <HubBuilder />
      </div>
    </div>
  );
}
