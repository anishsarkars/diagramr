import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiStatusMonitor } from '@/components/api-status-monitor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// List of admin emails or user IDs that can access this page
const ADMIN_USERS = [
  'admin@diagramr.com',
  // Add additional admin emails here
];

export default function ApiStatusPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true); // Simplified for now
  const [isChecking, setIsChecking] = useState(false);

  // In a real implementation, you would check session from your auth provider
  // For now, we'll skip the auth check for development purposes

  if (isChecking) {
    return (
      <div className="container mx-auto px-4">
        <div className="py-10 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4">
        <div className="py-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You are not authorized to view this page.</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => router.push('/')}>Back to App</Button>
        </div>

        <Tabs defaultValue="api-status">
          <TabsList className="mb-6">
            <TabsTrigger value="api-status">API Status</TabsTrigger>
            <TabsTrigger value="system-logs">System Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-status">
            <ApiStatusMonitor />
          </TabsContent>
          
          <TabsContent value="system-logs">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">System Logs</h2>
              <p className="text-gray-500">System logs will be implemented in a future update.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
              <p className="text-gray-500">Admin settings will be implemented in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 