import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, BarChart3, Settings, FileUp, FileDown, Plus, Filter } from "lucide-react";
import Header from "@/components/layout/header";

export default function WytDuty() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* WytDuty Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <CheckCircle className="h-8 w-8 mr-3" />
                WytDuty Enterprise
              </h1>
              <p className="text-blue-100 mt-2">Duty & Task Management with Approvals, Calendar & Reports</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-500 text-white px-3 py-1">
                Admin Mode
              </Badge>
              <p className="text-sm text-blue-100 mt-1">Organization: Demo Corp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="duties" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              All Duties
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Data Tools
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Duties</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">+12 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <Clock className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Need immediate action</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Duties */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Duties</CardTitle>
                <CardDescription>Latest duty assignments across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Monthly Team Sync Report", assignee: "Sarah K.", status: "pending", priority: "high", due: "Tomorrow" },
                    { title: "Weekly Code Review", assignee: "Mike R.", status: "for_approval", priority: "medium", due: "Friday" },
                    { title: "Database Backup Verification", assignee: "Alex P.", status: "completed", priority: "high", due: "Yesterday" },
                    { title: "Customer Survey Analysis", assignee: "Emma L.", status: "pending", priority: "low", due: "Next week" },
                  ].map((duty, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{duty.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to: {duty.assignee}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={
                          duty.status === 'completed' ? 'default' : 
                          duty.status === 'for_approval' ? 'secondary' : 'outline'
                        }>
                          {duty.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500">Due: {duty.due}</p>
                        <Badge variant={duty.priority === 'high' ? 'destructive' : duty.priority === 'medium' ? 'secondary' : 'outline'}>
                          {duty.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Duties Tab */}
          <TabsContent value="duties" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Duties</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Duty
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { id: "D001", title: "Q4 Financial Report", assignee: "Finance Team", status: "pending", priority: "high", schedule: "monthly_before_5" },
                    { id: "D002", title: "Security Audit Review", assignee: "Security Team", status: "for_approval", priority: "high", schedule: "onetime" },
                    { id: "D003", title: "Weekly Newsletter", assignee: "Marketing", status: "pending", priority: "medium", schedule: "weekly_before_sat" },
                    { id: "D004", title: "Server Maintenance", assignee: "DevOps", status: "completed", priority: "high", schedule: "monthly_before_28" },
                    { id: "D005", title: "Team Standup", assignee: "Development", status: "pending", priority: "low", schedule: "daily_not_sun" },
                  ].map((duty) => (
                    <div key={duty.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{duty.id}</span>
                          <h3 className="font-semibold">{duty.title}</h3>
                          <Badge variant={duty.priority === 'high' ? 'destructive' : duty.priority === 'medium' ? 'secondary' : 'outline'}>
                            {duty.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Assigned to: {duty.assignee} • Schedule: {duty.schedule.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          duty.status === 'completed' ? 'default' : 
                          duty.status === 'for_approval' ? 'secondary' : 'outline'
                        }>
                          {duty.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Duties waiting for management approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: "D002", title: "Security Audit Review", requestedBy: "John Smith", date: "2 hours ago", priority: "high" },
                    { id: "D008", title: "Budget Revision Request", requestedBy: "Finance Team", date: "1 day ago", priority: "medium" },
                    { id: "D012", title: "New Vendor Onboarding", requestedBy: "Procurement", date: "3 days ago", priority: "low" },
                  ].map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{approval.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Requested by: {approval.requestedBy} • {approval.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={approval.priority === 'high' ? 'destructive' : approval.priority === 'medium' ? 'secondary' : 'outline'}>
                          {approval.priority}
                        </Badge>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Calendar</CardTitle>
                <CardDescription>Duty schedules, holidays, and important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Calendar View</h3>
                  <p className="text-gray-500 dark:text-gray-500">Interactive calendar with duty schedules and holidays</p>
                  <Button className="mt-4" variant="outline">
                    Configure Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Users</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", email: "sarah@democorp.com", role: "admin", status: "active", duties: 23 },
                    { name: "Mike Rodriguez", email: "mike@democorp.com", role: "member", status: "active", duties: 18 },
                    { name: "Alex Parker", email: "alex@democorp.com", role: "member", status: "active", duties: 31 },
                    { name: "Emma Liu", email: "emma@democorp.com", role: "member", status: "active", duties: 12 },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{user.duties} duties</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tools Tab */}
          <TabsContent value="tools" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backup & Restore</CardTitle>
                  <CardDescription>Manage your duty data snapshots</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <FileDown className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileUp className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Last backup: January 15, 2025 at 3:22 PM
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export & Reports</CardTitle>
                  <CardDescription>Generate reports and export data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="w-full">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}