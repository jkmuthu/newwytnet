import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Image, FileText, Video, Music, Upload, Search, Eye, Trash2, Grid3x3, List, Download } from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  displayId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  imageCount: number;
  videoCount: number;
  documentCount: number;
  audioCount: number;
}

export default function AdminMedia() {
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'document' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch media files
  const { data: mediaData, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['/api/admin/media', { search: searchQuery, mimeType: mediaFilter !== 'all' ? mediaFilter : '' }],
  });

  // Fetch media stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/media/stats'],
  });

  const mediaFiles = ((mediaData as any)?.media || []) as MediaFile[];
  const stats = ((statsData as any)?.stats || {
    totalFiles: 0,
    totalSize: 0,
    imageCount: 0,
    videoCount: 0,
    documentCount: 0,
    audioCount: 0,
  }) as MediaStats;

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/media/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media/stats'] });
      setIsDetailOpen(false);
      setSelectedMedia(null);
      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete media file",
        variant: "destructive",
      });
    },
  });

  const getMediaTypeFromMime = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getMediaIcon = (mimeType: string) => {
    const type = getMediaTypeFromMime(mimeType);
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getMediaTypeBadge = (mimeType: string) => {
    const type = getMediaTypeFromMime(mimeType);
    const badges = {
      image: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Image</Badge>,
      document: <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Document</Badge>,
      video: <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Video</Badge>,
      audio: <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Audio</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge variant="secondary">File</Badge>;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewMedia = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsDetailOpen(true);
  };

  const handleDeleteMedia = () => {
    if (selectedMedia) {
      deleteMediaMutation.mutate(selectedMedia.id);
    }
  };

  const filteredMedia = mediaFiles.filter(media => {
    const mediaType = getMediaTypeFromMime(media.mimeType);
    return mediaFilter === 'all' || mediaType === mediaFilter;
  });

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">{formatFileSize(stats.totalSize)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.imageCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videoCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Library
                <Badge variant="secondary">{filteredMedia.length} files</Badge>
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
              <TabsTrigger value="all" data-testid="tab-all">All ({stats.totalFiles})</TabsTrigger>
              <TabsTrigger value="image" data-testid="tab-image">Images ({stats.imageCount})</TabsTrigger>
              <TabsTrigger value="video" data-testid="tab-video">Videos ({stats.videoCount})</TabsTrigger>
              <TabsTrigger value="document" data-testid="tab-document">Documents ({stats.documentCount})</TabsTrigger>
              <TabsTrigger value="audio" data-testid="tab-audio">Audio ({stats.audioCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoadingMedia ? (
            <div className="text-center py-12 text-muted-foreground">Loading media files...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No media files found matching your search' : 'No media files yet'}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewMedia(media)} data-testid={`card-media-${media.id}`}>
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {getMediaTypeFromMime(media.mimeType) === 'image' ? (
                        <img src={media.url} alt={media.originalName} className="w-full h-full object-cover" />
                      ) : (
                        getMediaIcon(media.mimeType)
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="font-medium truncate">{media.originalName}</p>
                    <div className="flex items-center justify-between mt-2">
                      {getMediaTypeBadge(media.mimeType)}
                      <span className="text-xs text-muted-foreground">{formatFileSize(media.size)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((media) => (
                <div
                  key={media.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewMedia(media)}
                  data-testid={`row-media-${media.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                      {getMediaIcon(media.mimeType)}
                    </div>
                    <div>
                      <p className="font-medium">{media.originalName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getMediaTypeBadge(media.mimeType)}
                        <span className="text-xs text-muted-foreground">{formatFileSize(media.size)}</span>
                        <span className="text-xs text-muted-foreground">• {format(new Date(media.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewMedia(media); }} data-testid={`button-view-${media.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                {getMediaTypeFromMime(selectedMedia.mimeType) === 'image' ? (
                  <img src={selectedMedia.url} alt={selectedMedia.originalName} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center">
                    {getMediaIcon(selectedMedia.mimeType)}
                    <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">File Name</p>
                  <p className="text-sm text-muted-foreground">{selectedMedia.originalName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <div className="mt-1">{getMediaTypeBadge(selectedMedia.mimeType)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium">Size</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Uploaded</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(selectedMedia.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Display ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedMedia.displayId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">MIME Type</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedMedia.mimeType}</p>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(selectedMedia.url, '_blank')} data-testid="button-download-media">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMedia}
                  disabled={deleteMediaMutation.isPending}
                  data-testid="button-delete-media"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMediaMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
