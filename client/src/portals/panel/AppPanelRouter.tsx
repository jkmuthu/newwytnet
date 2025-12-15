import { Switch, Route } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  FileText, 
  Package, 
  Calendar, 
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import WytApiPage from "./pages/wytapi";
import AppPanelHome from "./pages/app-panel-home";

function WytDutyDashboard() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">WytDuty Dashboard</h1>
              <p className="text-white/90 text-sm">Manage your duties and tasks efficiently</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Duties</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Duties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Complete project documentation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Today</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Review team reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Tomorrow</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Submit monthly reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutyMyDuties() {
  const [activeTab, setActiveTab] = useState("all");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Duties</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal duties and responsibilities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Duty
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No duties yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first duty</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Duty
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending duties</h3>
              <p className="text-gray-600 dark:text-gray-400">All caught up!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed duties</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete duties to see them here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No overdue duties</h3>
              <p className="text-gray-600 dark:text-gray-400">Great job staying on track!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WytDutyAssigned() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Duties</h1>
        <p className="text-gray-600 dark:text-gray-400">Duties assigned by others</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No assigned duties</h3>
          <p className="text-gray-600 dark:text-gray-400">You have no duties assigned by others yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutyCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Duty Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">View your duties in calendar format</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Calendar View</h3>
          <p className="text-gray-600 dark:text-gray-400">Calendar integration coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WytDutySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WytDuty Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your duty management preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates for duties</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Due Date Reminders</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded before due dates</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// App name mappings for display
const appNameMap: Record<string, string> = {
  'wytduty': 'WytDuty',
  'wytqrc': 'WytQRC',
  'wytpass': 'WytPass',
  'wytwall': 'WytWall',
  'wytassessor': 'WytAssessor',
  'wytbuilder': 'WytBuilder',
  'wytlife': 'WytLife',
};

function GenericAppDashboard({ appName }: { appName: string }) {
  // Convert slug to display name (e.g., 'expense-calculator' -> 'Expense Calculator')
  const slugToDisplayName = (slug: string): string => {
    // Check if we have a mapped name first
    if (appNameMap[slug.toLowerCase()]) {
      return appNameMap[slug.toLowerCase()];
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const displayName = slugToDisplayName(appName);
  
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <p className="text-white/90 text-sm">App dashboard and features</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">App Panel Active</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You are now in {displayName} app panel. App-specific features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GenericAppSettings({ appName }: { appName: string }) {
  // Convert slug to display name
  const slugToDisplayName = (slug: string): string => {
    // Check if we have a mapped name first
    if (appNameMap[slug.toLowerCase()]) {
      return appNameMap[slug.toLowerCase()];
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const displayName = slugToDisplayName(appName);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{displayName} Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your {displayName} preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage notification preferences</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Export or delete your data</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppPanelRouter() {
  return (
    <Switch>
      {/* App Panel Home - Shows all added apps */}
      <Route path="/apppanel" component={AppPanelHome} />

      {/* WytApi App Routes */}
      <Route path="/apppanel/wytapi" component={WytApiPage} />

      {/* WytDuty App Routes - Use full paths */}
      <Route path="/apppanel/wytduty/settings" component={WytDutySettings} />
      <Route path="/apppanel/wytduty/calendar" component={WytDutyCalendar} />
      <Route path="/apppanel/wytduty/assigned" component={WytDutyAssigned} />
      <Route path="/apppanel/wytduty/my-duties" component={WytDutyMyDuties} />
      <Route path="/apppanel/wytduty/dashboard" component={WytDutyDashboard} />
      <Route path="/apppanel/wytduty" component={WytDutyDashboard} />

      {/* Generic app routes - Must come after specific app routes */}
      {/* Settings route for all apps - Most specific first */}
      <Route path="/apppanel/:appSlug/settings">
        {(params) => <GenericAppSettings appName={params.appSlug || 'App'} />}
      </Route>
      
      {/* Dashboard/default route for all apps */}
      <Route path="/apppanel/:appSlug/dashboard">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>
      
      <Route path="/apppanel/:appSlug">
        {(params) => <GenericAppDashboard appName={params.appSlug || 'App'} />}
      </Route>

      {/* 404 for app panel */}
      <Route>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              App Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The requested app does not exist
            </p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
