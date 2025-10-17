import PagesMenuCMS from "@/components/builders/pages-menu-cms";

export default function AdminCMS() {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Pages & Menus</h1>
        <p className="text-sm text-muted-foreground">Build pages with content blocks and manage navigation structure</p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <PagesMenuCMS />
      </div>
    </div>
  );
}
