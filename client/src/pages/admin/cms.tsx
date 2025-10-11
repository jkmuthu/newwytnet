import CMSBuilder from "@/components/builders/cms-builder";

export default function AdminCMS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CMS Builder</h1>
        <p className="text-muted-foreground">Manage home page content, menus, and promotion cards</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border">
        <CMSBuilder />
      </div>
    </div>
  );
}
