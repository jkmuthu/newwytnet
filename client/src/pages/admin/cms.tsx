import CMSBuilder from "@/components/builders/cms-builder";
import MenuManager from "@/components/builders/menu-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminCMS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CMS Builder</h1>
        <p className="text-muted-foreground">Manage home page content, menus, and promotion cards</p>
      </div>
      
      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages" data-testid="tab-pages-cms">Pages CMS</TabsTrigger>
          <TabsTrigger value="menus" data-testid="tab-menu-manager">Menu Manager</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages" className="space-y-4">
          <div className="bg-card rounded-lg border border-border">
            <CMSBuilder />
          </div>
        </TabsContent>
        
        <TabsContent value="menus" className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <MenuManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
