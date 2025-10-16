import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminDetailWorkspaceProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function AdminDetailWorkspace({ leftContent, rightContent }: AdminDetailWorkspaceProps) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] gap-6 max-h-[75vh]">
      {/* Left Column: Controls & Metadata */}
      <ScrollArea className="h-full pr-4">
        {leftContent}
      </ScrollArea>

      {/* Vertical Separator */}
      <Separator orientation="vertical" className="hidden lg:block" />

      {/* Right Column: AI Assistant */}
      <ScrollArea className="h-full">
        <div className="space-y-4">
          {rightContent}
        </div>
      </ScrollArea>
    </div>
  );
}
