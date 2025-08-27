import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MapPin, Users, CreditCard, BarChart3, Building2, Phone, Mail, Plus } from "lucide-react";
import Header from "@/components/layout/header";

export default function RealBro() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* RealBro Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Building2 className="h-8 w-8 mr-3" />
                RealBro Property Brother
              </h1>
              <p className="text-orange-100 mt-2">தமிழ்நாடு சொத்து மேலாண்மை தளம் | Tamil Nadu Property Management</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500 text-white px-3 py-1">
                Demo Mode
              </Badge>
              <p className="text-sm text-orange-100 mt-1">Credits: 5 remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Credits
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <MapPin className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Ready for sale</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sold</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits</CardTitle>
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">₹250 each</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>Your latest property listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, title: "3 BHK Apartment in Anna Nagar", price: "₹85,00,000", status: "Available", location: "Chennai" },
                    { id: 2, title: "2 BHK House in Coimbatore", price: "₹45,00,000", status: "Sold", location: "Coimbatore" },
                    { id: 3, title: "Villa in ECR", price: "₹1,20,00,000", status: "Available", location: "Chennai" },
                  ].map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{property.price}</p>
                        <Badge variant={property.status === 'Available' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Property Listings</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: "3 BHK Apartment in Anna Nagar",
                  price: "₹85,00,000",
                  size: "1200 sq ft",
                  location: "Anna Nagar, Chennai",
                  status: "Available",
                  commission: "2%"
                },
                {
                  id: 2,
                  title: "2 BHK House in Coimbatore",
                  price: "₹45,00,000",
                  size: "900 sq ft", 
                  location: "RS Puram, Coimbatore",
                  status: "Sold",
                  commission: "₹50,000"
                },
                {
                  id: 3,
                  title: "Villa in ECR",
                  price: "₹1,20,00,000",
                  size: "2500 sq ft",
                  location: "ECR, Chennai",
                  status: "Available",
                  commission: "1.5%"
                }
              ].map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <Badge variant={property.status === 'Available' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold">{property.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span>{property.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Commission:</span>
                        <span className="text-green-600 font-semibold">{property.commission}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                      <Button variant="outline" size="sm" className="flex-1">Share</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Broker Network</CardTitle>
                <CardDescription>Manage your broker contacts and network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ravi Kumar", phone: "+91 98765 43210", email: "ravi@example.com", district: "Chennai" },
                    { name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@example.com", district: "Coimbatore" },
                    { name: "Murugan S", phone: "+91 76543 21098", email: "murugan@example.com", district: "Madurai" },
                  ].map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{contact.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                          <Mail className="h-3 w-3 ml-3 mr-1" />
                          {contact.email}
                        </div>
                      </div>
                      <Badge variant="outline">{contact.district}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Wallet</CardTitle>
                  <CardDescription>Manage your property listing credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-orange-600 mb-2">5</div>
                    <p className="text-gray-600 dark:text-gray-400">Credits Remaining</p>
                    <p className="text-sm text-gray-500 mt-2">Each credit allows you to list one property</p>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Buy More Credits - ₹250 each
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit History</CardTitle>
                  <CardDescription>Your recent credit transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "USED", amount: -1, description: "Property listing: Anna Nagar Apartment", date: "2 days ago" },
                      { type: "PURCHASED", amount: 10, description: "Credit purchase - ₹2,500", date: "1 week ago" },
                      { type: "FREE", amount: 1, description: "Welcome bonus", date: "2 weeks ago" },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                        <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your property sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Properties Listed</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Properties Sold</span>
                      <span className="font-semibold text-green-600">4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-semibold">33%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Commission</span>
                      <span className="font-semibold text-orange-600">₹2,15,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>District-wise Distribution</CardTitle>
                  <CardDescription>Properties by district</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { district: "Chennai", count: 6, percentage: 50 },
                      { district: "Coimbatore", count: 3, percentage: 25 },
                      { district: "Madurai", count: 2, percentage: 17 },
                      { district: "Salem", count: 1, percentage: 8 },
                    ].map((item) => (
                      <div key={item.district} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.district}</span>
                          <span>{item.count} properties</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
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