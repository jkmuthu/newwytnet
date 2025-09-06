// API utility functions for platform modules
import { apiRequest } from "@/lib/queryClient";

export interface PlatformModule {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'user';  // 'user' = Apps (user-facing), 'platform' = Modules (system components)
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

// Helper functions to distinguish Apps from Modules
export function getUserApps(modules: PlatformModule[]): PlatformModule[] {
  return modules.filter(module => module.category === 'user');
}

export function getPlatformModules(modules: PlatformModule[]): PlatformModule[] {
  return modules.filter(module => module.category === 'platform');
}

export interface PlatformModulesResponse {
  success: boolean;
  modules: PlatformModule[];
}

// Fetch all platform modules
export async function fetchPlatformModules(): Promise<PlatformModule[]> {
  try {
    const response = await apiRequest('/api/platform-modules', 'GET');
    const data = await response.json() as PlatformModulesResponse;
    return data.modules || [];
  } catch (error) {
    console.error('Failed to fetch platform modules:', error);
    return [];
  }
}

// Fetch only enabled platform modules
export async function fetchEnabledPlatformModules(): Promise<PlatformModule[]> {
  try {
    const response = await apiRequest('/api/platform-modules/enabled', 'GET');
    const data = await response.json() as PlatformModulesResponse;
    return data.modules || [];
  } catch (error) {
    console.error('Failed to fetch enabled platform modules:', error);
    return [];
  }
}

// Update platform module (Super Admin only)
export async function updatePlatformModule(id: string, updateData: Partial<PlatformModule>) {
  const response = await apiRequest(`/api/platform-modules/${id}`, 'PUT', updateData);
  return response.json();
}

// Create new platform module (Super Admin only)
export async function createPlatformModule(moduleData: Omit<PlatformModule, 'createdAt' | 'updatedAt'>) {
  const response = await apiRequest('/api/platform-modules', 'POST', moduleData);
  return response.json();
}

// Delete platform module (Super Admin only)
export async function deletePlatformModule(id: string) {
  const response = await apiRequest(`/api/platform-modules/${id}`, 'DELETE');
  return response.json();
}