import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Calendar functionality - placeholder for enhanced version
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, Plus, Bell, Settings, TrendingUp, Filter } from "lucide-react";
import Header from "@/components/layout/header";

// Calendar localizer - placeholder for enhanced version

export default function WytDutyEnhanced() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: duties, isLoading } = useQuery({
    queryKey: ["/api/wytduty/enhanced-duties"],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/wytduty/analytics"],
    retry: false,
  });

  const { data: approvals } = useQuery({
    queryKey: ["/api/wytduty/pending-approvals"],
    retry: false,
  });

  // Sample events for calendar
  const events = [
    {
      id: 1,
      title: "Morning Security Duty",
      start: new Date(2024, 11, 25, 6, 0),
      end: new Date(2024, 11, 25, 14, 0),
      resource: { status: "confirmed", location: "Main Gate" }
    },
    {
      id: 2,
      title: "IT Support Duty",
      start: new Date(2024, 11, 26, 9, 0),
      end: new Date(2024, 11, 26, 17, 0),
      resource: { status: "pending", location: "Tech Center" }
    },
    {
      id: 3,
      title: "Night Patrol",
      start: new Date(2024, 11, 27, 22, 0),
      end: new Date(2024, 11, 28, 6, 0),
      resource: { status: "approved", location: "Campus" }
    }
  ];

  const EventComponent = ({ event }: any) => (
    <div className="p-1 text-xs">
      <div className="font-semibold">{event.title}</div>
      <div className="text-gray-600">{event.resource.location}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                ✓ WytDuty Enterprise Enhanced
              </h1>
              <p className="text-blue-100 mt-2">Advanced Enterprise Duty & Schedule Management Platform</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-500 text-white px-3 py-1 mb-2">
                Professional Edition
              </Badge>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-1" />
                  3 Notifications
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Next: 6:00 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="duties">My Duties</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Enhanced Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Advanced Calendar View
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Duty
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <CalendarDays className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Enhanced Calendar View</h3>
                    <p className="text-gray-500 dark:text-gray-500">Advanced calendar with drag & drop scheduling</p>
                    <div className="mt-4 space-y-2">
                      {events.map((event, index) => (
                        <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border text-sm">
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-gray-600">{event.resource.location} • {event.resource.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Duties Tab */}
          <TabsContent value="duties" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: "Morning Security Check", 
                  time: "06:00 - 14:00", 
                  location: "Main Entrance",
                  status: "confirmed",
                  priority: "high",
                  team: "Security Team A"
                },
                { 
                  title: "IT Support Coverage", 
                  time: "09:00 - 17:00", 
                  location: "Tech Center",
                  status: "pending",
                  priority: "medium",
                  team: "IT Support"
                },
                { 
                  title: "Evening Maintenance", 
                  time: "18:00 - 02:00", 
                  location: "Building B",
                  status: "approved",
                  priority: "low",
                  team: "Maintenance"
                }
              ].map((duty, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{duty.title}</CardTitle>
                      <Badge className={
                        duty.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        duty.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {duty.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {duty.time}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {duty.team}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="font-medium">{duty.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Priority:</span>
                        <Badge variant="outline" className={
                          duty.priority === 'high' ? 'border-red-200 text-red-800' :
                          duty.priority === 'medium' ? 'border-orange-200 text-orange-800' :
                          'border-green-200 text-green-800'
                        }>
                          {duty.priority}
                        </Badge>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button className="flex-1" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Duty requests requiring your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ravi Kumar", duty: "Weekend Security Duty", requested: "2 hours ago", urgency: "high" },
                    { name: "Priya Sharma", duty: "Holiday IT Support", requested: "4 hours ago", urgency: "medium" },
                    { name: "Murugan S", duty: "Night Maintenance Shift", requested: "1 day ago", urgency: "low" }
                  ].map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{approval.name}</h4>
                        <p className="text-sm text-gray-600">{approval.duty}</p>
                        <p className="text-xs text-gray-500">Requested {approval.requested}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          approval.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          approval.urgency === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {approval.urgency}
                        </Badge>
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Duty Completion Rate</span>
                    <span className="font-semibold text-green-600">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "97%"}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Average Response Time</span>
                    <span className="font-semibold">2.3 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "78%"}}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Team Satisfaction</span>
                    <span className="font-semibold text-green-600">4.7/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "94%"}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Duties This Week</span>
                    <Badge variant="outline">47</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge className="bg-green-100 text-green-800">38</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress</span>
                    <Badge className="bg-blue-100 text-blue-800">6</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Approval</span>
                    <Badge className="bg-orange-100 text-orange-800">3</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Automation Rules
                </CardTitle>
                <CardDescription>Set up automated workflows for duty management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">🤖 Auto-approve low priority duties</h4>
                  <p className="text-sm text-gray-600 mb-3">Automatically approve duties with low priority from trusted team members</p>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">📧 Smart notifications</h4>
                  <p className="text-sm text-gray-600 mb-3">Send intelligent reminders based on duty patterns and urgency</p>
                  <Button size="sm" variant="outline">Setup</Button>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 Auto-reporting</h4>
                  <p className="text-sm text-gray-600 mb-3">Generate performance reports automatically at the end of each week</p>
                  <Button size="sm" variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Ravi Kumar", role: "Security Lead", duties: 12, performance: 94, status: "active" },
                { name: "Priya Sharma", role: "IT Support", duties: 8, performance: 98, status: "active" },
                { name: "Murugan S", role: "Maintenance", duties: 15, performance: 87, status: "busy" },
                { name: "Lakshmi R", role: "Admin", duties: 6, performance: 92, status: "active" },
                { name: "Arjun T", role: "Security", duties: 10, performance: 89, status: "offline" },
                { name: "Divya K", role: "Supervisor", duties: 4, performance: 96, status: "active" }
              ].map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Duties</span>
                        <span className="font-semibold">{member.duties}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Performance</span>
                        <span className="font-semibold text-green-600">{member.performance}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status</span>
                        <Badge className={
                          member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'busy' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}