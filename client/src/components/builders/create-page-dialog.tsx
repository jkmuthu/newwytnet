import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; route: string }) => void;
  isLoading: boolean;
}

export default function CreatePageDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreatePageDialogProps) {
  const [title, setTitle] = useState("");
  const [route, setRoute] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !route.trim()) return;
    
    onSubmit({ title: title.trim(), route: route.trim() });
    
    // Reset form
    setTitle("");
    setRoute("");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate route from title
    if (!route || route === generateRoute(title)) {
      setRoute(generateRoute(value));
    }
  };

  const generateRoute = (text: string) => {
    return '/' + text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new page with a navigation menu item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., About Us"
                required
                autoFocus
                data-testid="input-page-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="page-route">Page Route</Label>
              <Input
                id="page-route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g., /about"
                required
                data-testid="input-page-route"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The URL path for this page (must start with /)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !route.trim() || isLoading}
              data-testid="button-create-page-submit"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
