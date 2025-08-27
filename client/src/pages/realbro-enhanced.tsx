import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Filter, TrendingUp, Phone, Mail, Plus, Eye, Heart, Share2, Calculator } from "lucide-react";
import Header from "@/components/layout/header";

export default function RealBroEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState("properties");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["/api/realbro/demo-properties", searchTerm, priceRange, propertyType, location],
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/realbro/analytics"],
    retry: false,
  });

  const { data: brokerNetwork } = useQuery({
    queryKey: ["/api/realbro/broker-network"],
    retry: false,
  });

  const filteredProperties = properties?.filter((property: any) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = !priceRange || checkPriceRange(property.price, priceRange);
    const matchesType = !propertyType || property.title.toLowerCase().includes(propertyType.toLowerCase());
    const matchesLocation = !location || property.location.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesPrice && matchesType && matchesLocation;
  }) || [];

  function checkPriceRange(price: string, range: string) {
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''));
    switch(range) {
      case 'under-50': return numPrice < 5000000;
      case '50-100': return numPrice >= 5000000 && numPrice <= 10000000;
      case 'above-100': return numPrice > 10000000;
      default: return true;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                🏠 RealBro Property Brother Enhanced
              </h1>
              <p className="text-orange-100 mt-2">Advanced Tamil Nadu Property Management Platform</p>
            </div>
            <div className="text-right">
              <Badge className="bg-orange-500 text-white px-3 py-1">
                Professional Edition
              </Badge>
              <p className="text-sm text-orange-100 mt-1">Credits: 5 remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Search & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Advanced Property Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-1 lg:col-span-2"
              />
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-50">Under ₹50L</SelectItem>
                  <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
                  <SelectItem value="above-100">Above ₹1Cr</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="coimbatore">Coimbatore</SelectItem>
                  <SelectItem value="madurai">Madurai</SelectItem>
                  <SelectItem value="salem">Salem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
            <TabsTrigger value="network">Broker Network</TabsTrigger>
            <TabsTrigger value="calculator">EMI Calculator</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
          </TabsList>

          {/* Enhanced Properties Tab */}
          <TabsContent value="properties" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/80">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/80">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                      {property.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-orange-600">{property.price}</span>
                      <span className="text-sm text-gray-500">{property.size}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Trends</CardTitle>
                  <CardDescription>Average property prices by district</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Chennai Central</span>
                    <div className="text-right">
                      <span className="font-semibold">₹8,500/sq ft</span>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5.2%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Coimbatore</span>
                    <div className="text-right">
                      <span className="font-semibold">₹4,200/sq ft</span>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +3.8%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Madurai</span>
                    <div className="text-right">
                      <span className="font-semibold">₹3,100/sq ft</span>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2.1%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Insights</CardTitle>
                  <CardDescription>Key market indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Properties Sold (This Month)</span>
                    <Badge variant="outline">847</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Days on Market</span>
                    <Badge variant="outline">23 days</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Appreciation</span>
                    <Badge className="bg-green-100 text-green-800">+4.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Levels</span>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Broker Network Tab */}
          <TabsContent value="network" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Ravi Kumar", district: "Chennai", properties: 23, rating: 4.8, phone: "+91 98765 43210" },
                { name: "Priya Sharma", district: "Coimbatore", properties: 18, rating: 4.9, phone: "+91 87654 32109" },
                { name: "Murugan S", district: "Madurai", properties: 31, rating: 4.7, phone: "+91 76543 21098" },
              ].map((broker, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold">{broker.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{broker.name}</h3>
                        <p className="text-sm text-gray-600">{broker.district}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Properties</span>
                        <span className="font-semibold">{broker.properties}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rating</span>
                        <div className="flex items-center">
                          <span className="font-semibold mr-1">{broker.rating}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* EMI Calculator Tab */}
          <TabsContent value="calculator" className="mt-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  EMI Calculator
                </CardTitle>
                <CardDescription>Calculate your home loan EMI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Loan Amount (₹)</label>
                  <Input placeholder="50,00,000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Interest Rate (%)</label>
                  <Input placeholder="8.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Loan Tenure (Years)</label>
                  <Input placeholder="20" />
                </div>
                <Button className="w-full">Calculate EMI</Button>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex justify-between">
                    <span>Monthly EMI</span>
                    <span className="font-bold text-orange-600">₹41,822</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends" className="mt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Market Trends Analysis</h3>
              <p className="text-gray-500 dark:text-gray-500">Advanced market trends and predictive analytics</p>
              <Button className="mt-4" variant="outline">
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}