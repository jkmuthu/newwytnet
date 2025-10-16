import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Video, FileText, Trash2, Search, Filter } from "lucide-react";
import { useHubAdminAuth } from "@/contexts/HubAdminAuthContext";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const { hubAdminUser } = useHubAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch media files
  const { data: mediaData, isLoading } = useQuery<{ data: MediaFile[], total: number }>({
    queryKey: ['/api/hub-admin/media', filterType],
    enabled: !!hubAdminUser,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('/api/hub-admin/media/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub-admin/media'] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/hub-admin/media/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub-admin/media'] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      setPreviewOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(id);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredMedia = mediaData?.data?.filter((file) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'images' && file.mimeType.startsWith('image/')) ||
      (filterType === 'videos' && file.mimeType.startsWith('video/')) ||
      (filterType === 'documents' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'));
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400" data-testid="text-page-title">
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your hub's media files with cloud storage
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button className="cursor-pointer" data-testid="button-upload-media" disabled={uploadMutation.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? "Uploading..." : "Upload File"}
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
        </label>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-media"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="select-filter-type">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading media files...</div>
      ) : filteredMedia.length === 0 ? (
        <Card className="p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No media files yet</h3>
          <p className="text-gray-500 mb-4">Upload your first file to get started</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((file) => (
            <Card
              key={file.id}
              className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => {
                setSelectedFile(file);
                setPreviewOpen(true);
              }}
              data-testid={`card-media-${file.id}`}
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {file.mimeType.startsWith('image/') ? (
                  <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              {/* Actions (on hover) */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  data-testid={`button-delete-${file.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img src={selectedFile.url} alt={selectedFile.originalName} className="max-h-96 object-contain" />
                ) : selectedFile.mimeType.startsWith('video/') ? (
                  <video src={selectedFile.url} controls className="max-h-96 w-full" />
                ) : (
                  <div className="text-center text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-2" />
                    <p>Preview not available</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Uploaded</p>
                  <p className="font-medium">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">URL</p>
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-all">
                    {selectedFile.url}
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedFile.id)}
                  data-testid="button-delete-file"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
