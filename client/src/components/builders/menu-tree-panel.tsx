import { useState } from "react";
import { ChevronRight, ChevronDown, Menu as MenuIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  pageId?: string | null;
  isActive: boolean;
}

interface MenuTreePanelProps {
  menus: NavigationMenu[];
  selectedMenu: NavigationMenu | null;
  onMenuSelect: (menu: NavigationMenu) => void;
  onMenusReorder: (menus: NavigationMenu[]) => void;
  isLoading: boolean;
}

function SortableMenuItem({ menu, isSelected, onSelect }: {
  menu: NavigationMenu;
  isSelected: boolean;
  onSelect: () => void;
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      )}
      onClick={onSelect}
      data-testid={`menu-item-${menu.id}`}
    >
      <MenuIcon className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{menu.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{menu.route}</p>
      </div>
      {menu.pageId && (
        <FileText className="h-3 w-3 text-gray-400" />
      )}
    </div>
  );
}

export default function MenuTreePanel({
  menus,
  selectedMenu,
  onMenuSelect,
  onMenusReorder,
  isLoading,
}: MenuTreePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = menus.findIndex((menu) => menu.id === active.id);
      const newIndex = menus.findIndex((menu) => menu.id === over?.id);
      const reordered = arrayMove(menus, oldIndex, newIndex);
      onMenusReorder(reordered);
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "border-r dark:border-gray-700 bg-white dark:bg-gray-800 p-4",
        isCollapsed ? "w-12" : "w-80"
      )}>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-r dark:border-gray-700 bg-white dark:bg-gray-800 transition-all",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Navigation Menu
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          data-testid="button-toggle-menu-panel"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Menu Items */}
      {!isCollapsed && (
        <div className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
                <SortableMenuItem
                  key={menu.id}
                  menu={menu}
                  isSelected={selectedMenu?.id === menu.id}
                  onSelect={() => onMenuSelect(menu)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {menus.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No menu items yet</p>
              <p className="text-xs mt-1">Click "Create Page" to add one</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
