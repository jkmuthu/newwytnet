import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function ModuleBuilder() {
  const [dsl, setDsl] = useState(`{
  "name": "Contact",
  "description": "Customer contact management",
  "fields": [
    {
      "name": "firstName",
      "type": "string",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "unique": true
    },
    {
      "name": "phone",
      "type": "string",
      "validation": {
        "regex": "^[+]?[1-9]\\\\d{9,14}$"
      }
    },
    {
      "name": "company",
      "type": "ref",
      "model": "Company"
    },
    {
      "name": "tags",
      "type": "string[]"
    }
  ],
  "permissions": {
    "create": "role:editor",
    "read": "role:viewer", 
    "update": "role:editor",
    "delete": "role:admin"
  }
}`);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: models } = useQuery({
    queryKey: ["/api/models"],
    retry: false,
    enabled: isAuthenticated,
  });

  const validateMutation = useMutation({
    mutationFn: async (dslData: string) => {
      return await apiRequest("POST", "/api/dsl/validate", { dsl: dslData });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "DSL validation passed!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createModelMutation = useMutation({
    mutationFn: async (modelData: any) => {
      return await apiRequest("POST", "/api/models", modelData);
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Model created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (modelId: string) => {
      return await apiRequest("POST", "/api/generate/model", { modelId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CRUD components generated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleValidate = () => {
    validateMutation.mutate(dsl);
  };

  const handleCreateModel = () => {
    try {
      const parsedDsl = JSON.parse(dsl);
      createModelMutation.mutate({
        name: parsedDsl.name,
        description: parsedDsl.description,
        schema: parsedDsl,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">CRUD Module Builder</h2>
          <p className="text-muted-foreground">Define data models with JSON DSL and generate full CRUD operations</p>
        </div>
        <Button 
          onClick={handleCreateModel}
          disabled={createModelMutation.isPending}
          data-testid="button-create-module"
        >
          <i className="fas fa-plus mr-2"></i>
          New Module
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Model Definition */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Model Definition (JSON DSL)</h3>
          <div className="space-y-4">
            <Textarea
              value={dsl}
              onChange={(e) => setDsl(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder="Enter your model definition here..."
              data-testid="textarea-dsl"
            />
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                onClick={handleValidate}
                disabled={validateMutation.isPending}
                data-testid="button-validate"
              >
                <i className="fas fa-check-circle mr-1"></i>
                {validateMutation.isPending ? "Validating..." : "Validate"}
              </Button>
              <Button 
                onClick={handleCreateModel}
                disabled={createModelMutation.isPending}
                data-testid="button-generate-crud"
              >
                <i className="fas fa-cog mr-1"></i>
                {createModelMutation.isPending ? "Generating..." : "Generate CRUD"}
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Output Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Generated Components</h3>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-database text-green-600"></i>
                  <span className="text-sm font-medium">Prisma Model</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Generated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-server text-blue-600"></i>
                  <span className="text-sm font-medium">NestJS Controller</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Generated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-layer-group text-purple-600"></i>
                  <span className="text-sm font-medium">Service Layer</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Generated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-desktop text-yellow-600"></i>
                  <span className="text-sm font-medium">Admin UI Pages</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Generated</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">CLI Commands</h4>
            <code className="text-sm text-foreground block mb-1">wyt dsl validate ./defs/contact.json</code>
            <code className="text-sm text-foreground block mb-1">wyt generate model ./defs/contact.json</code>
            <code className="text-sm text-foreground block">wyt migrate</code>
          </div>
        </div>
      </div>

      {/* Existing Modules */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Existing Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models?.map((model: any) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-base" data-testid={`text-model-${model.name.toLowerCase()}`}>
                    {model.name}
                  </CardTitle>
                  <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                    {model.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{model.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{model.schema?.fields?.length || 0} fields</span>
                  <span>{new Date(model.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => generateMutation.mutate(model.id)}
                    disabled={generateMutation.isPending}
                    data-testid={`button-view-${model.name.toLowerCase()}`}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) || (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No modules created yet. Create your first module to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
