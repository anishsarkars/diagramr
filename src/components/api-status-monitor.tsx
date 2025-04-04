"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getApiKeyStatus, resetAllApiKeys } from "@/utils/googleSearch";
import { toast } from "sonner";

interface ApiKeyStatus {
  totalKeys: number;
  availableKeys: number;
  unavailableKeys: number;
  healthStatus: 'critical' | 'warning' | 'healthy';
  totalUsage: number;
  avgUsagePerKey: number;
  loadBalance: number;
  timeSinceLastFailure: number | null;
  lastFailedKeyPrefix: string | null;
  nextKeyToUsePrefix: string | null;
}

export function ApiStatusMonitor() {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Function to fetch the latest status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const currentStatus = getApiKeyStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error("Error fetching API key status:", error);
      toast.error("Failed to fetch API key status");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset all keys
  const handleReset = async () => {
    try {
      const resetStatus = resetAllApiKeys();
      setStatus(resetStatus);
      toast.success("All API keys have been reset successfully");
    } catch (error) {
      console.error("Error resetting API keys:", error);
      toast.error("Failed to reset API keys");
    }
  };

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, []);

  // Set up auto refresh if enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStatus();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (!status && loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>API Key Status</CardTitle>
          <CardDescription>Loading key status information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-pulse h-40 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>API Key Status</CardTitle>
          <CardDescription>Unable to load key status information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to retrieve API key status information.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchStatus}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Helper to format time since last failure
  const formatTimeSince = (ms: number | null) => {
    if (ms === null) return "No failures recorded";
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Status badge color
  const statusColors = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500"
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Google API Key Status</CardTitle>
            <CardDescription>Monitor Google Custom Search API key health and usage</CardDescription>
          </div>
          <Badge className={statusColors[status.healthStatus]}>
            {status.healthStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key availability */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Available API Keys</span>
            <span className="text-sm font-medium">{status.availableKeys} / {status.totalKeys}</span>
          </div>
          <Progress 
            value={(status.availableKeys / status.totalKeys) * 100} 
            className={`h-2 ${status.availableKeys < status.totalKeys / 2 ? 'bg-red-100' : 'bg-green-100'}`}
          />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Requests</h4>
            <p className="text-2xl font-bold">{status.totalUsage}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Load Balance</h4>
            <p className="text-2xl font-bold">{status.loadBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500">(Lower is better)</p>
          </div>
        </div>

        {/* Last failure */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Key Failure</h4>
          {status.lastFailedKeyPrefix ? (
            <div>
              <p>Key: <span className="font-mono">{status.lastFailedKeyPrefix}...</span></p>
              <p>Time: {formatTimeSince(status.timeSinceLastFailure)}</p>
            </div>
          ) : (
            <p>No key failures recorded</p>
          )}
        </div>

        {/* Next key to use */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Next Key to Use</h4>
          {status.nextKeyToUsePrefix ? (
            <p className="font-mono">{status.nextKeyToUsePrefix}...</p>
          ) : (
            <p className="text-red-500">No available keys!</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={fetchStatus} variant="outline" disabled={loading}>
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm">Auto-refresh</label>
          </div>
        </div>
        <Button onClick={handleReset} variant="destructive">
          Reset All Keys
        </Button>
      </CardFooter>
    </Card>
  );
} 