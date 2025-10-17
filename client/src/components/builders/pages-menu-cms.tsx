import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus, Save, Eye } from "lucide-react";
import MenuTreePanel from "./menu-tree-panel";
import PageBuilderPanel from "./page-builder-panel";
import PropertiesPanel from "./properties-panel";

interface NavigationMenu {
  id: string;
  title: string;
  route: string;
  icon?: string;
  order: number;
  scope: string;
  pageId?: string | null;
  isActive: boolean;
}

interface Page {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  path: string;
  content: any[];
  status: string;
}

interface Block {
  id: string;
  type: string;
  content: any;
  settings?: any;
}

export default function PagesMenuCMS() {
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenu | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [pageBlocks, setPageBlocks] = useState<Block[]>([]);
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch navigation menus
  const { data: fetchedMenus, isLoading: menusLoading } = useQuery<NavigationMenu[]>({
    queryKey: ['/api/admin/navigation-menus'],
  });

  // Fetch page when menu is selected
  const { data: page, isLoading: pageLoading } = useQuery<Page>({
    queryKey: ['/api/pages', selectedMenu?.pageId],
    enabled: !!selectedMenu?.pageId,
  });

  // Update menus state when fetched
  useEffect(() => {
    if (fetchedMenus) {
      setMenus(fetchedMenus);
    }
  }, [fetchedMenus]);

  // Update selected page and blocks when page data changes
  useEffect(() => {
    if (page) {
      setSelectedPage(page);
      setPageBlocks(page.content || []);
    }
  }, [page]);

  // Create page + menu mutation
  const createPageMenuMutation = useMutation({
    mutationFn: async (data: { title: string; route: string }) => {
      // First create the page
      const page = (await apiRequest('/api/pages', 'POST', {
        title: data.title,
        slug: data.route.replace(/^\//, '').replace(/\//g, '-'),
        path: data.route,
        content: [],
        status: 'draft',
      })) as Page;

      // Then create the menu item linked to the page
      const menu = (await apiRequest('/api/admin/navigation-menus', 'POST', {
        title: data.title,
        route: data.route,
        pageId: page.id,
        scope: 'engine',
      })) as NavigationMenu;

      return { page, menu };
    },
    onSuccess: () => {
      toast({
        title: "Page Created",
        description: "New page and menu item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive",
      });
    },
  });

  // Save page content mutation
  const savePageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPage) return;
      
      return await apiRequest(`/api/pages/${selectedPage.id}`, 'PATCH', {
        content: pageBlocks,
      });
    },
    onSuccess: () => {
      toast({
        title: "Changes Saved",
        description: "Page content saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pages', selectedPage?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        variant: "destructive",
      });
    },
  });

  const handleMenuSelect = (menu: NavigationMenu) => {
    setSelectedMenu(menu);
    setSelectedBlock(null);
  };

  const handleBlockSelect = (block: Block | null) => {
    setSelectedBlock(block);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<Block>) => {
    setPageBlocks(blocks =>
      blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
    );
  };

  const handleBlockAdd = (block: Block) => {
    setPageBlocks(blocks => [...blocks, block]);
  };

  const handleBlockDelete = (blockId: string) => {
    setPageBlocks(blocks => blocks.filter(b => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleMenusReorder = (reorderedMenus: NavigationMenu[]) => {
    setMenus(reorderedMenus);
  };

  const handleCreatePage = () => {
    const title = prompt("Enter page title:");
    if (!title) return;

    const route = prompt("Enter page route (e.g., /about):");
    if (!route) return;

    createPageMenuMutation.mutate({ title, route });
  };

  const handleSave = () => {
    savePageMutation.mutate();
  };

  const handlePreview = () => {
    if (selectedPage) {
      window.open(selectedPage.path, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pages & Menus
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage navigation menus and page content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreatePage}
            variant="default"
            data-testid="button-create-page"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
          {selectedPage && (
            <>
              <Button
                onClick={handlePreview}
                variant="outline"
                data-testid="button-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                variant="default"
                disabled={savePageMutation.isPending}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                {savePageMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Menu Tree */}
        <MenuTreePanel
          menus={menus}
          selectedMenu={selectedMenu}
          onMenuSelect={handleMenuSelect}
          onMenusReorder={handleMenusReorder}
          isLoading={menusLoading}
        />

        {/* Center Panel - Page Builder */}
        <PageBuilderPanel
          page={selectedPage}
          blocks={pageBlocks}
          selectedBlock={selectedBlock}
          onBlockSelect={handleBlockSelect}
          onBlockAdd={handleBlockAdd}
          onBlockDelete={handleBlockDelete}
          onBlocksReorder={setPageBlocks}
          isLoading={pageLoading}
        />

        {/* Right Panel - Properties */}
        <PropertiesPanel
          block={selectedBlock}
          onBlockUpdate={handleBlockUpdate}
        />
      </div>
    </div>
  );
}
