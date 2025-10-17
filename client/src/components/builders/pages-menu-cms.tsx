import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus, Save, Eye } from "lucide-react";
import MenuTreePanel from "./menu-tree-panel";
import PageBuilderPanel from "./page-builder-panel";
import PropertiesPanel from "./properties-panel";
import CreatePageDialog from "./create-page-dialog";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch navigation menus
  const { data: fetchedMenus, isLoading: menusLoading } = useQuery<NavigationMenu[]>({
    queryKey: ['/api/admin/navigation-menus'],
  });

  // Fetch page when menu is selected
  const { data: page, isLoading: pageLoading } = useQuery<Page>({
    queryKey: ['/api/admin/pages', selectedMenu?.pageId],
    enabled: !!selectedMenu?.pageId,
  });

  // Update menus state when fetched
  useEffect(() => {
    if (fetchedMenus) {
      setMenus(fetchedMenus);
    }
  }, [fetchedMenus]);

  // Update selected page and blocks when page data changes or menu selection changes
  useEffect(() => {
    if (page) {
      setSelectedPage(page);
      setPageBlocks(page.content || []);
    } else if (selectedMenu && !selectedMenu.pageId) {
      // Clear state when selecting a menu without a page
      setSelectedPage(null);
      setPageBlocks([]);
      setSelectedBlock(null);
    }
  }, [page, selectedMenu]);

  // Create page + menu mutation
  const createPageMenuMutation = useMutation({
    mutationFn: async (data: { title: string; route: string }) => {
      // First create the page
      const page = (await apiRequest('/api/admin/pages', 'POST', {
        title: data.title,
        slug: data.route.replace(/^\//, '').replace(/\//g, '-'),
        path: data.route,
        content: [],
        status: 'draft',
      })) as unknown as Page;

      // Then create the menu item linked to the page
      const menu = (await apiRequest('/api/admin/navigation-menus', 'POST', {
        title: data.title,
        route: data.route,
        pageId: page.id,
        scope: 'engine',
      })) as unknown as NavigationMenu;

      return { page, menu };
    },
    onSuccess: () => {
      toast({
        title: "Page Created",
        description: "New page and menu item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
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
      
      return await apiRequest(`/api/admin/pages/${selectedPage.id}`, 'PATCH', {
        content: pageBlocks,
      });
    },
    onSuccess: () => {
      toast({
        title: "Changes Saved",
        description: "Page content saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages', selectedPage?.id] });
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

  // Reorder menus mutation
  const reorderMenusMutation = useMutation({
    mutationFn: async (reorderedMenus: NavigationMenu[]) => {
      const updates = reorderedMenus.map((menu, index) => ({
        id: menu.id,
        order: index,
      }));
      
      return await apiRequest('/api/admin/navigation-menus/reorder', 'PATCH', {
        menus: updates,
      });
    },
    onSuccess: () => {
      toast({
        title: "Menu Order Saved",
        description: "Navigation menu order has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save menu order",
        variant: "destructive",
      });
    },
  });

  const handleMenusReorder = (reorderedMenus: NavigationMenu[]) => {
    setMenus(reorderedMenus);
    // Auto-save the new order
    reorderMenusMutation.mutate(reorderedMenus);
  };

  const handleCreatePage = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreatePageSubmit = (data: { title: string; route: string }) => {
    createPageMenuMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedPage ? (
            <span>Editing: <strong className="text-gray-900 dark:text-white">{selectedPage.title}</strong></span>
          ) : (
            <span>Select a menu item to edit its page, or create a new page</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreatePage}
            variant="outline"
            size="sm"
            data-testid="button-create-page"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            disabled={!selectedPage}
            data-testid="button-preview"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            variant="default"
            size="sm"
            disabled={!selectedPage || savePageMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 mr-2" />
            {savePageMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
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

      {/* Create Page Dialog */}
      <CreatePageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreatePageSubmit}
        isLoading={createPageMenuMutation.isPending}
      />
    </div>
  );
}
