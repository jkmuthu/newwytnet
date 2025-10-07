import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WytWallLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function WytWallLayout({ leftPanel, centerPanel, rightPanel }: WytWallLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Panel - Filters & Categories (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {leftPanel}
              </Card>
            </div>
          </div>

          {/* Center Panel - Main Content Stream */}
          <div className="col-span-1 lg:col-span-6">
            {centerPanel}
          </div>

          {/* Right Panel - Apps & Promotions (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {rightPanel}
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Sheet for Filters (shown when filter button is clicked) */}
      <div className="lg:hidden">
        {/* Mobile filters will be implemented as a sheet/drawer */}
      </div>
    </div>
  );
}
