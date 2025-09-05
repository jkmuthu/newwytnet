// API utility functions for platform modules
import { apiRequest } from "@/lib/queryClient";

export interface PlatformModule {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'user';
  type: string;
  status: 'enabled' | 'disabled' | 'maintenance';
  pricing: string;
  price?: string;
  currency?: string;
  icon: string;
  color: string;
  route: string;
  features?: string[];
  metadata?: any;
  usage?: number;
  installs?: number;
  creator?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformModulesResponse {
  success: boolean;
  modules: PlatformModule[];
}

// Fetch all platform modules
export async function fetchPlatformModules(): Promise<PlatformModule[]> {
  try {
    const response = await apiRequest('/api/platform-modules', 'GET') as PlatformModulesResponse;
    return response.modules || [];
  } catch (error) {
    console.error('Failed to fetch platform modules:', error);
    return [];
  }
}

// Fetch only enabled platform modules
export async function fetchEnabledPlatformModules(): Promise<PlatformModule[]> {
  try {
    const response = await apiRequest('/api/platform-modules/enabled', 'GET') as PlatformModulesResponse;
    return response.modules || [];
  } catch (error) {
    console.error('Failed to fetch enabled platform modules:', error);
    return [];
  }
}

// Update platform module (Super Admin only)
export async function updatePlatformModule(id: string, updateData: Partial<PlatformModule>) {
  return apiRequest(`/api/platform-modules/${id}`, 'PUT', updateData);
}

// Create new platform module (Super Admin only)
export async function createPlatformModule(moduleData: Omit<PlatformModule, 'createdAt' | 'updatedAt'>) {
  return apiRequest('/api/platform-modules', 'POST', moduleData);
}

// Delete platform module (Super Admin only)
export async function deletePlatformModule(id: string) {
  return apiRequest(`/api/platform-modules/${id}`, 'DELETE');
}