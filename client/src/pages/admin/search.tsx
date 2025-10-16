import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Building, Package, FileText, X } from "lucide-react";

export default function AdminSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic will be implemented here
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <p className="text-muted-foreground">Search across users, organizations, modules, and content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </CardTitle>
          <CardDescription>Find anything in the platform quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search users, organizations, modules, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-query"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearSearch}
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" data-testid="button-search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-search-all">
            All Results
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-search-users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="orgs" data-testid="tab-search-orgs">
            <Building className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-search-modules">
            <Package className="h-4 w-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-search-content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              {!searchQuery ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Start searching</p>
                  <p className="text-sm mt-2">Enter a search term to find users, organizations, modules, or content</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm mt-2">Try different keywords or check your spelling</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Users</span>
                <Badge variant="secondary">0 results</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No users found matching your search</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Organizations</span>
                <Badge variant="secondary">0 results</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No organizations found matching your search</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Modules</span>
                <Badge variant="secondary">0 results</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No modules found matching your search</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Content</span>
                <Badge variant="secondary">0 results</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No content found matching your search</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
