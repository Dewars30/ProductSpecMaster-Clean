import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface GoogleDriveStatusProps {
  onSyncSuccess?: () => void;
}

export default function GoogleDriveStatus({ onSyncSuccess }: GoogleDriveStatusProps) {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check URL parameters for Google OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get('google_connected');
    const googleError = urlParams.get('google_error');

    if (googleConnected === 'true') {
      toast({
        title: "Google Drive Connected!",
        description: "You can now sync your documents",
      });
      setConnectionStatus('connected');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (googleError) {
      let errorMessage = "Failed to connect Google Drive";
      switch (googleError) {
        case 'oauth_denied':
          errorMessage = "Google Drive access was denied";
          break;
        case 'no_code':
          errorMessage = "Authorization failed - no code received";
          break;
        case 'no_access_token':
          errorMessage = "Failed to get access token from Google";
          break;
        case 'callback_failed':
          errorMessage = "Google OAuth callback failed";
          break;
      }
      
      toast({
        title: "Google Drive Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setConnectionStatus('disconnected');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Check connection status on mount
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    onSuccess: (userData) => {
      if (userData?.googleAccessToken) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    },
    onError: () => {
      setConnectionStatus('disconnected');
    }
  });

  const connectGoogleDrive = () => {
    window.location.href = '/api/google/auth';
  };

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync-drive');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced || 0} product specifications from Google Drive`,
      });
      onSyncSuccess?.();
    },
    onError: (error: Error) => {
      if (error.message.includes('Google Drive not connected')) {
        setConnectionStatus('disconnected');
        toast({
          title: "Google Drive Not Connected",
          description: "Please connect your Google Drive first",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  if (connectionStatus === 'checking') {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Checking Google Drive connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Google Drive</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                  {connectionStatus === 'connected' ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Connected
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {connectionStatus === 'connected' ? (
              <Button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {syncMutation.isPending ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Specifications
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={connectGoogleDrive}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Google Drive
              </Button>
            )}
          </div>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-amber-800">Google Drive Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Connect your Google Drive to sync product specifications and enable AI-powered specification analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
