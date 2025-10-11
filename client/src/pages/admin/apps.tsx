import AppBuilder from "@/components/builders/app-builder";

export default function AdminApps() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">App Builder</h1>
        <p className="text-muted-foreground">Compose modules into complete applications</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border">
        <AppBuilder />
      </div>
    </div>
  );
}
