import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Save, Eye, Settings, Trash2, GripVertical,
  Type, Image, Layout, Star, Mail, Users, FileText, Loader2, Globe, Palette
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  data: any;
}

interface SitePage {
  id: string;
  title: string;
  slug: string;
  path: string;
  content: Block[];
  isHomePage: boolean;
  showInNav: boolean;
}

interface Site {
  id: string;
  name: string;
  subdomain: string;
  theme: any;
}

const BLOCK_TYPES = [
  { type: 'hero', name: 'Hero Section', icon: Layout, description: 'Large header with title and CTA' },
  { type: 'features', name: 'Features Grid', icon: Star, description: '3-column features showcase' },
  { type: 'text', name: 'Text Block', icon: Type, description: 'Rich text content section' },
  { type: 'services', name: 'Services', icon: Users, description: 'Service cards with pricing' },
  { type: 'contact', name: 'Contact Info', icon: Mail, description: 'Contact details section' },
  { type: 'gallery', name: 'Image Gallery', icon: Image, description: 'Photo grid display' },
  { type: 'testimonials', name: 'Testimonials', icon: FileText, description: 'Customer reviews' },
];

function getDefaultBlockData(type: string): any {
  switch (type) {
    case 'hero':
      return {
        title: 'Welcome to Our Site',
        subtitle: 'Discover amazing things with us',
        buttonText: 'Get Started',
        buttonLink: '#',
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      };
    case 'features':
      return {
        title: 'Our Features',
        features: [
          { title: 'Feature 1', description: 'Description of feature 1' },
          { title: 'Feature 2', description: 'Description of feature 2' },
          { title: 'Feature 3', description: 'Description of feature 3' },
        ],
      };
    case 'text':
      return {
        title: 'About Us',
        content: 'Enter your content here...',
      };
    case 'services':
      return {
        title: 'Our Services',
        services: [
          { title: 'Service 1', description: 'Service description', price: '$99' },
          { title: 'Service 2', description: 'Service description', price: '$199' },
          { title: 'Service 3', description: 'Service description', price: '$299' },
        ],
      };
    case 'contact':
      return {
        title: 'Contact Us',
        subtitle: 'We would love to hear from you',
        email: 'contact@example.com',
        phone: '+1 234 567 890',
        address: '123 Main St, City, Country',
      };
    default:
      return {};
  }
}

function SortableBlock({ block, onEdit, onDelete }: { block: Block; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockInfo = BLOCK_TYPES.find(b => b.type === block.type);
  const Icon = blockInfo?.icon || Layout;

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="border-2 hover:border-indigo-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{blockInfo?.name || block.type}</p>
                <p className="text-sm text-gray-500">{block.data?.title || 'Click to edit'}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`edit-block-${block.id}`}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-600" data-testid={`delete-block-${block.id}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BlockEditor({ block, onSave, onClose }: { block: Block; onSave: (data: any) => void; onClose: () => void }) {
  const [data, setData] = useState(block.data);

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <div className="space-y-4">
      {block.type === 'hero' && (
        <>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={data.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input value={data.buttonText || ''} onChange={(e) => updateField('buttonText', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Button Link</Label>
            <Input value={data.buttonLink || ''} onChange={(e) => updateField('buttonLink', e.target.value)} />
          </div>
        </>
      )}

      {block.type === 'text' && (
        <>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea rows={6} value={data.content || ''} onChange={(e) => updateField('content', e.target.value)} />
          </div>
        </>
      )}

      {block.type === 'contact' && (
        <>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={data.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={data.email || ''} onChange={(e) => updateField('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={data.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={data.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          </div>
        </>
      )}

      {block.type === 'features' && (
        <>
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
          </div>
          <div className="space-y-4">
            <Label>Features</Label>
            {data.features?.map((feature: any, index: number) => (
              <div key={index} className="p-3 border rounded-md space-y-2">
                <Input 
                  placeholder="Feature title" 
                  value={feature.title} 
                  onChange={(e) => {
                    const newFeatures = [...data.features];
                    newFeatures[index] = { ...feature, title: e.target.value };
                    updateField('features', newFeatures);
                  }} 
                />
                <Textarea 
                  placeholder="Feature description" 
                  value={feature.description} 
                  onChange={(e) => {
                    const newFeatures = [...data.features];
                    newFeatures[index] = { ...feature, description: e.target.value };
                    updateField('features', newFeatures);
                  }} 
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1" data-testid="save-block-changes">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

export default function WytSitePageEditor() {
  const params = useParams();
  const siteId = params.siteId as string;
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: siteData, isLoading: siteLoading } = useQuery({
    queryKey: ['/api/wytsite/sites', siteId],
    queryFn: async () => {
      const res = await fetch(`/api/wytsite/sites/${siteId}`);
      if (!res.ok) throw new Error('Failed to load site');
      return res.json();
    },
    enabled: !!siteId,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ['/api/wytsite/pages', siteId],
    queryFn: async () => {
      const res = await fetch(`/api/wytsite/sites/${siteId}/pages`);
      if (!res.ok) throw new Error('Failed to load pages');
      return res.json();
    },
    enabled: !!siteId,
  });

  const site: Site | null = siteData?.site;
  const pages: SitePage[] = pagesData?.pages || [];
  const selectedPage = pages.find(p => p.id === selectedPageId) || pages.find(p => p.isHomePage) || pages[0];

  const savePageMutation = useMutation({
    mutationFn: async (content: Block[]) => {
      return apiRequest(`/api/wytsite/pages/${selectedPage?.id}`, 'PATCH', { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wytsite/pages', siteId] });
      toast({ title: 'Saved', description: 'Page content saved successfully' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Failed to save', variant: 'destructive' });
    },
  });

  useState(() => {
    if (selectedPage?.content) {
      setBlocks(selectedPage.content);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
    }
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
    };
    setBlocks(prev => [...prev, newBlock]);
    setIsAddingBlock(false);
    toast({ title: 'Block added', description: `${type} block added to page` });
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    toast({ title: 'Block removed', description: 'Block has been deleted' });
  };

  const updateBlockData = (blockId: string, data: any) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, data } : b));
  };

  const handleSave = () => {
    savePageMutation.mutate(blocks);
  };

  if (siteLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Site not found</h2>
        <Link href="/a/wytsite">
          <Button>Back to WytSite</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white dark:bg-gray-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/a/wytsite">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" />
              {site.name}
            </h1>
            <p className="text-sm text-gray-500">{selectedPage?.title || 'Select a page'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/site/${site.subdomain}`, '_blank')} data-testid="button-preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={savePageMutation.isPending} data-testid="button-save">
            {savePageMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-48 border-r bg-gray-50 dark:bg-gray-900 p-3">
          <h3 className="text-sm font-medium mb-3">Pages</h3>
          <div className="space-y-1">
            {pages.map(page => (
              <Button
                key={page.id}
                variant={selectedPage?.id === page.id ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedPageId(page.id);
                  setBlocks(page.content || []);
                }}
                data-testid={`page-${page.slug}`}
              >
                <FileText className="h-3 w-3 mr-2" />
                {page.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map(block => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onEdit={() => setEditingBlock(block)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => setIsAddingBlock(true)}>
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Add a block</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-64 border-l bg-gray-50 dark:bg-gray-900 p-4">
          <Tabs defaultValue="blocks">
            <TabsList className="w-full">
              <TabsTrigger value="blocks" className="flex-1">Blocks</TabsTrigger>
              <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
            </TabsList>
            <TabsContent value="blocks" className="mt-4">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2">
                  {BLOCK_TYPES.map(blockType => (
                    <Card
                      key={blockType.type}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addBlock(blockType.type)}
                      data-testid={`add-block-${blockType.type}`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                          <blockType.icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{blockType.name}</p>
                          <p className="text-xs text-gray-500">{blockType.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="style" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Theme settings</span>
                </div>
                <p className="text-xs text-gray-500">Configure site colors, fonts, and global styles in Settings.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Sheet open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Block</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingBlock && (
              <BlockEditor
                block={editingBlock}
                onSave={(data) => updateBlockData(editingBlock.id, data)}
                onClose={() => setEditingBlock(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
