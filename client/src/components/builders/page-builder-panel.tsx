import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Page {
  id: string;
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

interface PageBuilderPanelProps {
  page: Page | null;
  blocks: Block[];
  selectedBlock: Block | null;
  onBlockSelect: (block: Block | null) => void;
  onBlockAdd: (block: Block) => void;
  onBlockDelete: (blockId: string) => void;
  onBlocksReorder: (blocks: Block[]) => void;
  isLoading: boolean;
}

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero Banner', icon: '🎯' },
  { value: 'features', label: 'Feature Cards', icon: '✨' },
  { value: 'stats', label: 'Stats Banner', icon: '📊' },
  { value: 'richtext', label: 'Rich Text', icon: '📝' },
  { value: 'image', label: 'Image Gallery', icon: '🖼️' },
  { value: 'cta', label: 'CTA Button', icon: '🔔' },
  { value: 'contact', label: 'Contact Form', icon: '📧' },
];

function SortableBlock({ block, isSelected, onSelect, onDelete }: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockType = BLOCK_TYPES.find(t => t.value === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 border rounded-lg transition-colors group",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}
      onClick={onSelect}
      data-testid={`block-${block.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{blockType?.icon}</span>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {blockType?.label || block.type}
          </p>
        </div>
        {block.content?.title && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {block.content.title}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid={`button-delete-block-${block.id}`}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

export default function PageBuilderPanel({
  page,
  blocks,
  selectedBlock,
  onBlockSelect,
  onBlockAdd,
  onBlockDelete,
  onBlocksReorder,
  isLoading,
}: PageBuilderPanelProps) {
  const [blockTypeToAdd, setBlockTypeToAdd] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over?.id);
      const reordered = arrayMove(blocks, oldIndex, newIndex);
      onBlocksReorder(reordered);
    }
  };

  const handleAddBlock = () => {
    if (!blockTypeToAdd) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockTypeToAdd,
      content: getDefaultContent(blockTypeToAdd),
      settings: {},
    };

    onBlockAdd(newBlock);
    setBlockTypeToAdd("");
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          title: 'Welcome to Our Platform',
          subtitle: 'Build amazing applications',
          buttonText: 'Get Started',
          buttonLink: '#',
        };
      case 'features':
        return {
          title: 'Features',
          features: [
            { title: 'Fast', description: 'Lightning fast performance' },
            { title: 'Secure', description: 'Enterprise-grade security' },
            { title: 'Scalable', description: 'Grows with your needs' },
          ],
        };
      case 'stats':
        return {
          stats: [
            { label: 'Users', value: '10K+' },
            { label: 'Projects', value: '5K+' },
            { label: 'Uptime', value: '99.9%' },
          ],
        };
      case 'richtext':
        return {
          html: '<p>Your content here...</p>',
        };
      case 'image':
        return {
          images: [],
        };
      case 'cta':
        return {
          title: 'Ready to get started?',
          buttonText: 'Sign Up Now',
          buttonLink: '#',
        };
      case 'contact':
        return {
          title: 'Contact Us',
          fields: ['name', 'email', 'message'],
        };
      default:
        return {};
    }
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a menu item to edit its page</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            or create a new page to get started
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {page.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{page.path}</p>
      </div>

      {/* Add Block Section */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Select value={blockTypeToAdd} onValueChange={setBlockTypeToAdd}>
            <SelectTrigger className="flex-1" data-testid="select-block-type">
              <SelectValue placeholder="Select a block type to add..." />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddBlock}
            disabled={!blockTypeToAdd}
            data-testid="button-add-block"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Blocks Canvas */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {blocks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No blocks yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add your first block to start building your page
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlock?.id === block.id}
                    onSelect={() => onBlockSelect(block)}
                    onDelete={() => onBlockDelete(block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
