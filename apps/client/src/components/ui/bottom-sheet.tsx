import { ReactNode } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function BottomSheet({ open, onOpenChange, children }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[80vh] rounded-t-2xl border-t-2"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        {children}
      </SheetContent>
    </Sheet>
  );
}