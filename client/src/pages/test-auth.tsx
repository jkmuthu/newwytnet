import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { TestAuthContexts } from '@/components/TestAuthContexts';

export default function TestAuthPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-background">
        <TestAuthContexts />
      </div>
    </AdminAuthProvider>
  );
}