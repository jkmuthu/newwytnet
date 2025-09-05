import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SortableBlockProps {
  block: any;
  index: number;
  selectedBlock: any;
  onSelectBlock: (block: any) => void;
  onDeleteBlock: (blockId: string) => void;
}

export function SortableBlock({
  block,
  index,
  selectedBlock,
  onSelectBlock,
  onDeleteBlock,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:ring-2 hover:ring-ring cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${selectedBlock?.id === block.id ? 'ring-2 ring-ring' : ''}`}
      onClick={() => onSelectBlock(block)}
    >
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              data-testid={`drag-handle-${block.type}-${index}`}
            >
              <i className="fas fa-grip-vertical text-muted-foreground"></i>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{block.name}</span>
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="secondary"
              className="w-6 h-6 p-0"
              data-testid={`button-edit-${block.type}-${index}`}
            >
              <i className="fas fa-edit text-xs"></i>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlock(block.id);
              }}
              data-testid={`button-delete-${block.type}-${index}`}
            >
              <i className="fas fa-trash text-xs"></i>
            </Button>
          </div>
        </div>

        {block.type === 'hero' && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">{block.content.title || 'Hero Title'}</h1>
            <p className="text-blue-100 mb-4">{block.content.subtitle || 'Hero subtitle'}</p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              {block.content.buttonText || 'Get Started'}
            </Button>
          </div>
        )}

        {block.type === 'richtext' && (
          <div className="prose prose-sm max-w-none">
            <h2>{block.content.title || 'Rich Text Title'}</h2>
            <p>{block.content.content || 'Rich text content goes here...'}</p>
          </div>
        )}

        {block.type !== 'hero' && block.type !== 'richtext' && (
          <div className="text-center py-8 text-muted-foreground">
            {block.name} Block - Configure in properties panel
          </div>
        )}
      </CardContent>
    </Card>
  );
}