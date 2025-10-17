import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, GripVertical, Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavigationMenu {
  id: string;
  title: string;
  route: string;
  icon?: string;
  order: number;
  scope: string;
  isActive: boolean;
}

function SortableMenuRow({ menu, onUpdate, onDelete }: { 
  menu: NavigationMenu; 
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-12">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={menu.title}
          onChange={(e) => onUpdate(menu.id, 'title', e.target.value)}
          className="border-0 focus-visible:ring-1"
          data-testid={`input-menu-title-${menu.id}`}
        />
      </TableCell>
      <TableCell>
        <Input
          value={menu.route}
          onChange={(e) => onUpdate(menu.id, 'route', e.target.value)}
          className="border-0 focus-visible:ring-1"
          placeholder="/engine/..."
          data-testid={`input-menu-route-${menu.id}`}
        />
      </TableCell>
      <TableCell className="w-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(menu.id)}
          data-testid={`button-delete-menu-${menu.id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function MenuManager() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState("");
  const [newMenuRoute, setNewMenuRoute] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedMenus, isLoading } = useQuery<NavigationMenu[]>({
    queryKey: ['/api/admin/navigation-menus'],
  });

  useEffect(() => {
    if (fetchedMenus) {
      setMenus(fetchedMenus);
    }
  }, [fetchedMenus]);

  const createMenuMutation = useMutation({
    mutationFn: async (menuData: { title: string; route: string }) => {
      return await apiRequest('/api/admin/navigation-menus', 'POST', menuData);
    },
    onSuccess: () => {
      toast({
        title: "Menu Created",
        description: "Navigation menu item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
      setIsAddDialogOpen(false);
      setNewMenuTitle("");
      setNewMenuRoute("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu",
        variant: "destructive",
      });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NavigationMenu> }) => {
      return await apiRequest(`/api/admin/navigation-menus/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/navigation-menus/${id}`, 'DELETE', {});
    },
    onSuccess: () => {
      toast({
        title: "Menu Deleted",
        description: "Navigation menu item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menus'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu",
        variant: "destructive",
      });
    },
  });

  const reorderMenuMutation = useMutation({
    mutationFn: async (menus: { id: string; order: number }[]) => {
      return await apiRequest('/api/admin/navigation-menus/reorder', 'PATCH', { menus });
    },
    onSuccess: () => {
      toast({
        title: "Menu Order Saved",
        description: "Navigation menu order updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save menu order",
        variant: "destructive",
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdate = (id: string, field: string, value: string) => {
    setMenus(menus.map(menu => 
      menu.id === id ? { ...menu, [field]: value } : menu
    ));
  };

  const handleDelete = (id: string) => {
    deleteMenuMutation.mutate(id);
  };

  const handleSave = () => {
    const menusWithOrder = menus.map((menu, index) => ({
      id: menu.id,
      order: index,
    }));
    
    // Save order
    reorderMenuMutation.mutate(menusWithOrder);

    // Update individual menu items
    menus.forEach(menu => {
      updateMenuMutation.mutate({ 
        id: menu.id, 
        data: { 
          title: menu.title, 
          route: menu.route 
        } 
      });
    });
  };

  const handleAddMenu = () => {
    if (!newMenuTitle || !newMenuRoute) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and route",
        variant: "destructive",
      });
      return;
    }

    createMenuMutation.mutate({
      title: newMenuTitle,
      route: newMenuRoute,
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading menus...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Engine Navigation Menus</h3>
          <p className="text-sm text-muted-foreground">
            Manage navigation menus for the Engine Admin Panel
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-menu">
                <Plus className="h-4 w-4 mr-2" />
                Add Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Navigation Menu</DialogTitle>
                <DialogDescription>
                  Create a new navigation menu item for the Engine Admin Panel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Menu Title</Label>
                  <Input
                    id="title"
                    value={newMenuTitle}
                    onChange={(e) => setNewMenuTitle(e.target.value)}
                    placeholder="e.g., Dashboard"
                    data-testid="input-new-menu-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Route/URL</Label>
                  <Input
                    id="route"
                    value={newMenuRoute}
                    onChange={(e) => setNewMenuRoute(e.target.value)}
                    placeholder="e.g., /engine/dashboard"
                    data-testid="input-new-menu-route"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddMenu} 
                  disabled={createMenuMutation.isPending}
                  data-testid="button-create-menu"
                >
                  {createMenuMutation.isPending ? "Creating..." : "Create Menu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} variant="default" data-testid="button-save-menus">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Menu Title</TableHead>
              <TableHead>Route/URL</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={menus.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {menus.map((menu) => (
                  <SortableMenuRow
                    key={menu.id}
                    menu={menu}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No navigation menus yet. Click "Add Menu" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
