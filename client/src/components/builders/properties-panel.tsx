import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Block {
  id: string;
  type: string;
  content: any;
  settings?: any;
}

interface PropertiesPanelProps {
  block: Block | null;
  onBlockUpdate: (blockId: string, updates: Partial<Block>) => void;
}

export default function PropertiesPanel({ block, onBlockUpdate }: PropertiesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localContent, setLocalContent] = useState<any>({});

  useEffect(() => {
    if (block) {
      setLocalContent(block.content || {});
    }
  }, [block]);

  const handleContentChange = (key: string, value: any) => {
    const updated = { ...localContent, [key]: value };
    setLocalContent(updated);
    
    if (block) {
      onBlockUpdate(block.id, { content: updated });
    }
  };

  const renderField = (key: string, value: any) => {
    if (typeof value === 'string') {
      if (value.length > 100 || key === 'html') {
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Label>
            <Textarea
              value={value}
              onChange={(e) => handleContentChange(key, e.target.value)}
              placeholder={`Enter ${key}...`}
              rows={4}
              className="w-full"
              data-testid={`textarea-${key}`}
            />
          </div>
        );
      }
      
      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Label>
          <Input
            value={value}
            onChange={(e) => handleContentChange(key, e.target.value)}
            placeholder={`Enter ${key}...`}
            className="w-full"
            data-testid={`input-${key}`}
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Label>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {value.length} items
            </p>
            {value.map((item, index) => (
              <div key={index} className="mt-2 p-2 bg-white dark:bg-gray-900 rounded text-xs">
                {typeof item === 'object' ? JSON.stringify(item) : item}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Label>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="mb-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  {subKey}
                </Label>
                <Input
                  value={String(subValue)}
                  onChange={(e) => {
                    const updated = { ...value, [subKey]: e.target.value };
                    handleContentChange(key, updated);
                  }}
                  className="mt-1"
                  data-testid={`input-${key}-${subKey}`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!block) {
    return (
      <div className={cn(
        "border-l dark:border-gray-700 bg-white dark:bg-gray-800 transition-all",
        isCollapsed ? "w-12" : "w-80"
      )}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            data-testid="button-toggle-properties-panel"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="p-4 flex items-center justify-center h-64">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Select a block to edit its properties
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "border-l dark:border-gray-700 bg-white dark:bg-gray-800 transition-all",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Properties
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          data-testid="button-toggle-properties-panel"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Properties Form */}
      {!isCollapsed && (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            <div className="pb-2 border-b dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Block Type
              </p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {block.type}
              </p>
            </div>

            {Object.entries(localContent).map(([key, value]) => renderField(key, value))}

            {Object.keys(localContent).length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No properties available
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
