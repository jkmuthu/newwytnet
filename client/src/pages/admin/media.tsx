import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image, FileText, Video, Music, Upload, Search, Filter, Eye, Download, Trash2, Grid3x3, List } from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicUrl: string | null;
  uploadedAt: string;
  tenantId: string;
  createdBy: string | null;
}

export default function AdminMedia() {
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'document' | 'video' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedia = sampleMedia.filter(media => {
    const matchesType = mediaFilter === 'all' || media.type === mediaFilter;
    const matchesSearch = media.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getMediaTypeBadge = (type: string) => {
    const badges = {
      image: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Image</Badge>,
      document: <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Document</Badge>,
      video: <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Video</Badge>,
      audio: <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Audio</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge variant="secondary">{type}</Badge>;
  };

  const handleViewMedia = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Management</h1>
          <p className="text-muted-foreground">Manage all media files and assets</p>
        </div>
        <Button data-testid="button-upload-media">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Library
                <Badge variant="secondary">{sampleMedia.length} files</Badge>
              </CardTitle>
              <CardDescription>View and manage all media files</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-view-grid"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-media"
              />
            </div>
          </div>

          {/* Type Filter Tabs */}
          <Tabs value={mediaFilter} onValueChange={(value) => setMediaFilter(value as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-media-all">
                All ({sampleMedia.length})
              </TabsTrigger>
              <TabsTrigger value="image" data-testid="tab-media-images">
                Images ({sampleMedia.filter(m => m.type === 'image').length})
              </TabsTrigger>
              <TabsTrigger value="document" data-testid="tab-media-documents">
                Documents ({sampleMedia.filter(m => m.type === 'document').length})
              </TabsTrigger>
              <TabsTrigger value="video" data-testid="tab-media-videos">
                Videos ({sampleMedia.filter(m => m.type === 'video').length})
              </TabsTrigger>
              <TabsTrigger value="audio" data-testid="tab-media-audio">
                Audio ({sampleMedia.filter(m => m.type === 'audio').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Media Grid/List */}
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No media files found
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => handleViewMedia(media)}
                  data-testid={`media-card-${media.id}`}>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {media.type === 'image' && media.thumbnail ? (
                      <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">
                        {getMediaIcon(media.type)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm truncate flex-1" title={media.name}>
                          {media.name}
                        </h3>
                        {getMediaTypeBadge(media.type)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{media.size}</span>
                        <span>{format(new Date(media.uploadedAt), 'MMM dd')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => handleViewMedia(media)}
                  data-testid={`media-row-${media.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {media.type === 'image' && media.thumbnail ? (
                          <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400">
                            {getMediaIcon(media.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{media.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {getMediaTypeBadge(media.type)}
                          <span>{media.size}</span>
                          <span>Uploaded by {media.uploadedBy}</span>
                          <span>{format(new Date(media.uploadedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" data-testid={`button-view-${media.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-download-${media.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-delete-${media.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMedia && getMediaIcon(selectedMedia.type)}
              {selectedMedia?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedMedia?.type === 'image' && selectedMedia.url && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img src={selectedMedia.url} alt={selectedMedia.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-medium">{selectedMedia?.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <div className="mt-1">{selectedMedia && getMediaTypeBadge(selectedMedia.type)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded By</p>
                <p className="font-medium">{selectedMedia?.uploadedBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upload Date</p>
                <p className="font-medium">
                  {selectedMedia?.uploadedAt && format(new Date(selectedMedia.uploadedAt), 'PPP')}
                </p>
              </div>
              {selectedMedia?.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedMedia.category}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Full Size
              </Button>
              <Button variant="destructive" className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
