import { useQuery } from "@tanstack/react-query";

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  icon?: string;
  description?: string;
}

export interface FormModule {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  status: 'active' | 'inactive';
  createdBy: string;
  updatedAt: string;
}

// Hook for managing form fields dynamically
export function useFormFields(moduleId: string = 'whatsapp-registration') {
  const { data: formModule, isLoading } = useQuery({
    queryKey: ['/api/forms/modules', moduleId],
    retry: false,
    // For now, return default registration fields
    // In production, this would fetch from backend
    initialData: {
      id: 'whatsapp-registration',
      name: 'WhatsApp Registration Form',
      description: 'WytPass global registration form fields',
      fields: [
        {
          id: 'country',
          label: 'Country',
          type: 'select' as const,
          required: true,
          options: ['India', 'United States', 'United Kingdom', 'UAE', 'Singapore'],
          icon: 'globe',
          description: 'Select your country'
        },
        {
          id: 'whatsappNumber',
          label: 'WhatsApp Number',
          type: 'phone' as const,
          required: true,
          placeholder: '9876543210',
          icon: 'phone',
          description: 'Enter your WhatsApp number',
          validation: {
            pattern: '^[6-9]\\d{9}$',
            minLength: 10,
            maxLength: 10
          }
        },
        {
          id: 'name',
          label: 'Full Name',
          type: 'text' as const,
          required: true,
          placeholder: 'Enter your full name',
          icon: 'user',
          description: 'Enter your full name (2-100 characters)',
          validation: {
            minLength: 2,
            maxLength: 100
          }
        },
        {
          id: 'gender',
          label: 'Gender',
          type: 'select' as const,
          required: true,
          options: ['Male', 'Female', 'Other', 'Prefer not to say'],
          icon: 'venus-mars',
          description: 'Select your gender'
        },
        {
          id: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date' as const,
          required: true,
          icon: 'birthday-cake',
          description: 'Default set to 18 years back for easy selection'
        }
      ],
      status: 'active' as const,
      createdBy: 'super_admin',
      updatedAt: new Date().toISOString()
    }
  });

  return {
    formModule,
    fields: formModule?.fields || [],
    isLoading,
    updateField: (fieldId: string, updates: Partial<FormField>) => {
      // In production, this would make an API call to update the field
      console.log('Updating field:', fieldId, updates);
    },
    addField: (field: FormField) => {
      // In production, this would make an API call to add the field
      console.log('Adding field:', field);
    },
    removeField: (fieldId: string) => {
      // In production, this would make an API call to remove the field
      console.log('Removing field:', fieldId);
    }
  };
}