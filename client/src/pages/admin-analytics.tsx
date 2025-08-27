import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Download, RefreshCw, Filter } from "lucide-react";
import Header from "@/components/layout/header";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const { data: platformStats, isLoading } = useQuery({
    queryKey: ["/api/admin/platform-stats", dateRange],
    retry: false,
  });

  const { data: moduleStats } = useQuery({
    queryKey: ["/api/admin/module-stats", dateRange],
    retry: false,
  });

  const { data: userMetrics } = useQuery({
    queryKey: ["/api/admin/user-metrics", dateRange],
    retry: false,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["/api/admin/revenue-data", dateRange],
    retry: false,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Platform Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive insights across all WytNet modules and tenants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats?.totalUsers || 2847}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats?.activeTenants || 284}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenueData?.monthlyRevenue || "1,24,500"}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23.1% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.8%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">All systems operational</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Module Performance</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Module Performance */}
          <TabsContent value="modules" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    🧠 DISC Assessment
                    <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                  </CardTitle>
                  <CardDescription>Personality assessment module</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Assessments</span>
                    <span className="font-semibold">8,547</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Time</span>
                    <span className="font-semibold">12 min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "94%"}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    🏠 RealBro Property
                    <Badge className="ml-2 bg-orange-100 text-orange-800">Demo</Badge>
                  </CardTitle>
                  <CardDescription>Tamil Nadu real estate platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Brokers</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Properties Listed</span>
                    <span className="font-semibold">2,456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Credits Used</span>
                    <span className="font-semibold">1,890</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: "76%"}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    ✓ WytDuty Enterprise
                    <Badge className="ml-2 bg-blue-100 text-blue-800">Enterprise</Badge>
                  </CardTitle>
                  <CardDescription>Duty & task management platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Organizations</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duties Completed</span>
                    <span className="font-semibold">12,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Approval Rate</span>
                    <span className="font-semibold text-blue-600">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "97%"}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Analytics */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trends</CardTitle>
                  <CardDescription>User acquisition and retention metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>New Users (This Month)</span>
                      <Badge variant="outline">+347</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>User Retention (30d)</span>
                      <Badge variant="outline">78.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Daily Active Users</span>
                      <Badge variant="outline">1,247</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Session Duration</span>
                      <Badge variant="outline">24 min</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Users by location and region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">🇮🇳 India</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: "85%"}}></div>
                        </div>
                        <span className="text-sm">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">🇺🇸 USA</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: "8%"}}></div>
                        </div>
                        <span className="text-sm">8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">🇬🇧 UK</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: "4%"}}></div>
                        </div>
                        <span className="text-sm">4%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">🌍 Others</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: "3%"}}></div>
                        </div>
                        <span className="text-sm">3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Breakdown */}
          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Module</CardTitle>
                  <CardDescription>Monthly recurring revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>WytDuty Enterprise</span>
                    <span className="font-semibold">₹89,400 (72%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: "72%"}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>RealBro Credits</span>
                    <span className="font-semibold">₹28,750 (23%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: "23%"}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Assessment Pro</span>
                    <span className="font-semibold">₹6,350 (5%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: "5%"}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Trends</CardTitle>
                  <CardDescription>Payment methods and success rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Payment Success Rate</span>
                    <Badge className="bg-green-100 text-green-800">98.7%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Transaction</span>
                    <Badge variant="outline">₹2,847</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Payments</span>
                    <Badge variant="outline">23 (1.3%)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Rate</span>
                    <Badge variant="outline">0.8%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Real-time system performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>API Response Time</span>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">142ms</span>
                      <div className="text-xs text-gray-500">Excellent</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Performance</span>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">98.9%</span>
                      <div className="text-xs text-gray-500">Optimal</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Server Load</span>
                    <div className="text-right">
                      <span className="font-semibold text-yellow-600">68%</span>
                      <div className="text-xs text-gray-500">Normal</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Memory Usage</span>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">45%</span>
                      <div className="text-xs text-gray-500">Good</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Tracking</CardTitle>
                  <CardDescription>Recent errors and incidents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">All systems operational</span>
                    </div>
                    <span className="text-xs text-green-600">Now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm">Cache optimization in progress</span>
                    </div>
                    <span className="text-xs text-yellow-600">2h ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-sm">Routine maintenance completed</span>
                    </div>
                    <span className="text-xs text-gray-600">Yesterday</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}