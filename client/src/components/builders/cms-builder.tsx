import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";
import { apiRequest } from "@/lib/queryClient";
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
} from '@dnd-kit/sortable';
import { SortableBlock } from './sortable-block';

const blockTypes = [
  { type: 'hero', name: 'Hero Banner', icon: 'image', color: 'blue', description: 'Main landing page banner' },
  { type: 'navigation', name: 'Navigation Menu', icon: 'bars', color: 'gray', description: 'Header navigation links' },
  { type: 'promotion_cards', name: 'Promotion Cards', icon: 'credit-card', color: 'yellow', description: 'Feature/service promotion cards' },
  { type: 'stats_banner', name: 'Stats Banner', icon: 'chart-bar', color: 'green', description: 'User statistics and achievements' },
  { type: 'richtext', name: 'Rich Text', icon: 'align-left', color: 'green', description: 'Formatted text content' },
  { type: 'gallery', name: 'Image Gallery', icon: 'images', color: 'purple', description: 'Photo galleries' },
  { type: 'cta', name: 'CTA Button', icon: 'mouse-pointer', color: 'orange', description: 'Call-to-action buttons' },
  { type: 'collection', name: 'Collection Grid', icon: 'th', color: 'red', description: 'Dynamic content grids' },
  { type: 'form', name: 'Contact Form', icon: 'wpforms', color: 'indigo', description: 'Contact and feedback forms' },
  { type: 'footer', name: 'Footer Section', icon: 'window-minimize', color: 'gray', description: 'Site footer with links' },
];

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  indigo: 'text-indigo-600',
};

export default function CMSBuilder() {
  const [pageType, setPageType] = useState('home');
  const [selectedBlocks, setSelectedBlocks] = useState([
    {
      id: '1',
      type: 'hero',
      name: 'Hero Banner',
      content: {
        title: 'WytNet - Multi-SaaS Engine',
        subtitle: 'The ultimate platform for building, managing, and scaling SaaS applications',
        buttonText: 'Get Started Free',
        backgroundImage: '/wytnet-hero-bg.jpg',
        stats: {
          users: '1000+',
          rating: '4.9/5',
          growth: 'Growing Fast'
        }
      }
    },
    {
      id: '2',
      type: 'promotion_cards',
      name: 'Feature Cards',
      content: {
        title: 'Platform Features',
        cards: [
          {
            title: 'AI Directory',
            description: 'Comprehensive AI tools and services directory',
            icon: 'robot',
            color: 'green',
            link: '/ai-directory'
          },
          {
            title: 'WytApps',
            description: 'QR Generator, Disc Assessment & more',
            icon: 'tools',
            color: 'purple',
            link: '/qr-generator'
          },
          {
            title: 'WytHubs',
            description: 'RealBRO and other specialized hubs',
            icon: 'network-wired',
            color: 'orange',
            link: '/realbro'
          },
          {
            title: 'WytApps',
            description: 'Custom application marketplace',
            icon: 'mobile-alt',
            color: 'blue',
            link: '/wytapps'
          }
        ]
      }
    },
    {
      id: '3',
      type: 'stats_banner',
      name: 'Platform Stats',
      content: {
        title: 'Trusted by Users Worldwide',
        stats: [
          { label: 'Active Users', value: '1,000+', icon: 'users' },
          { label: 'User Rating', value: '4.9/5', icon: 'star' },
          { label: 'Growth Rate', value: 'Fast', icon: 'trending-up' },
          { label: 'Uptime', value: '99.9%', icon: 'check-circle' }
        ]
      }
    }
  ]);

  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages } = useQuery({
    queryKey: ["/api/pages"],
    retry: false,
  });

  const createPageMutation = useMutation({
    mutationFn: async (pageData: any) => {
      return await apiRequest("/api/pages", "POST", pageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddBlock = (blockType: any) => {
    const newBlock = {
      id: Date.now().toString(),
      type: blockType.type,
      name: blockType.name,
      content: getDefaultContent(blockType.type)
    };
    setSelectedBlocks([...selectedBlocks, newBlock]);
  };

  const getDefaultContent = (blockType: string) => {
    switch (blockType) {
      case 'hero':
        return {
          title: 'New Hero Title',
          subtitle: 'Hero subtitle',
          buttonText: 'Get Started',
          backgroundImage: '/hero-bg.jpg',
          stats: { users: '1000+', rating: '4.9/5', growth: 'Growing' }
        };
      case 'promotion_cards':
        return {
          title: 'Features',
          cards: [
            { title: 'Feature 1', description: 'Description', icon: 'star', color: 'blue', link: '#' }
          ]
        };
      case 'stats_banner':
        return {
          title: 'Statistics',
          stats: [
            { label: 'Users', value: '1000+', icon: 'users' }
          ]
        };
      case 'richtext':
        return {
          title: 'Rich Text Title',
          content: 'Rich text content goes here...'
        };
      default:
        return { title: 'New Block', content: 'Configure this block' };
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setSelectedBlocks(selectedBlocks.filter(block => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePublish = () => {
    createPageMutation.mutate({
      title: 'New Page',
      slug: 'new-page',
      path: '/new-page',
      content: {
        blocks: selectedBlocks
      },
      status: 'published'
    });
  };

  const { isSuperAdmin, user } = useWhatsAppAuth();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">📄 Pages CMS</h2>
          <p className="text-muted-foreground">Manage home page content, menus, and promotion cards</p>
          {isSuperAdmin && (
            <Badge variant="secondary" className="mt-2">
              🦸‍♂️ Super Admin Access
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={pageType} 
            onChange={(e) => setPageType(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="home">🏠 Home Page</option>
            <option value="landing">🚀 Landing Page</option>
            <option value="about">ℹ️ About Page</option>
            <option value="custom">⚙️ Custom Page</option>
          </select>
          <div className="flex space-x-2">
          <Button variant="secondary" data-testid="button-preview">
            <i className="fas fa-eye mr-2"></i>Preview
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={createPageMutation.isPending}
            data-testid="button-publish"
          >
            <i className="fas fa-save mr-2"></i>
            {createPageMutation.isPending ? "Publishing..." : "Publish"}
          </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Block Library */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Block Library</h3>
          <div className="space-y-2">
            {blockTypes.map((block) => (
              <div
                key={block.type}
                className="drag-item bg-muted p-3 rounded-md cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleAddBlock(block)}
                data-testid={`block-${block.type}`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`fas fa-${block.icon} ${colorClasses[block.color as keyof typeof colorClasses]}`}></i>
                  <div>
                    <div className="text-sm font-medium">{block.name}</div>
                    <div className="text-xs text-muted-foreground">{block.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-2 bg-background border-2 border-dashed border-border rounded-lg builder-grid relative overflow-y-auto">
          <div className="p-4 space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={selectedBlocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
                {selectedBlocks.map((block, index) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    index={index}
                    selectedBlock={selectedBlock}
                    onSelectBlock={setSelectedBlock}
                    onDeleteBlock={handleDeleteBlock}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {selectedBlocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none opacity-50">
                Drop blocks here to build your page
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Properties</h3>
          {selectedBlock ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Block Type</label>
                <p className="text-sm text-muted-foreground">{selectedBlock.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Background Color</label>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded border-2 border-ring cursor-pointer"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded border cursor-pointer"></div>
                  <div className="w-8 h-8 bg-green-500 rounded border cursor-pointer"></div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Padding</label>
                <select className="w-full p-2 border border-border rounded-md bg-background text-sm">
                  <option>None</option>
                  <option>Small</option>
                  <option selected>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Animation</label>
                <select className="w-full p-2 border border-border rounded-md bg-background text-sm">
                  <option selected>None</option>
                  <option>Fade In</option>
                  <option>Slide Up</option>
                  <option>Scale</option>
                </select>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a block to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
}
