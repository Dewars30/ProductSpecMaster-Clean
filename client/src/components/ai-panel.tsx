import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AIPanelProps {
  documentId: number;
  onQueryClick: () => void;
}

export default function AIPanel({ documentId, onQueryClick }: AIPanelProps) {
  const { toast } = useToast();
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/document/${documentId}/summarize`);
      return res.json() as Promise<{ summary: string }>;
    },
    onSuccess: (data) => {
      setAiResponse(data.summary);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to summarize document",
        variant: "destructive",
      });
    },
  });

  const extractActionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/document/${documentId}/extract-actions`);
      return res.json() as Promise<{ actions: string[] }>;
    },
    onSuccess: (data) => {
      setAiResponse(
        data.actions.length > 0 
          ? `Action Items:\n${data.actions.map((action, i) => `${i + 1}. ${action}`).join('\n')}`
          : "No action items found in this document."
      );
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to extract action items",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <i className="fas fa-robot text-blue-600 mr-2"></i>
          AI Assistant
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero Image */}
        <img 
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
          alt="AI interface with chat bubbles and smart suggestions" 
          className="w-full h-32 object-cover rounded-lg"
        />

        {/* AI Suggestions */}
        <div className="space-y-3">
          <Button
            onClick={() => summarizeMutation.mutate()}
            disabled={summarizeMutation.isPending}
            className="w-full text-left justify-start bg-white border border-gray-200 hover:border-blue-600 text-gray-900 hover:text-blue-900 h-auto p-3"
          >
            <i className="fas fa-magic text-blue-600 mr-3"></i>
            {summarizeMutation.isPending ? 'Summarizing...' : 'Summarize this document'}
          </Button>
          
          <Button
            onClick={() => extractActionsMutation.mutate()}
            disabled={extractActionsMutation.isPending}
            className="w-full text-left justify-start bg-white border border-gray-200 hover:border-blue-600 text-gray-900 hover:text-blue-900 h-auto p-3"
          >
            <i className="fas fa-list-check text-blue-600 mr-3"></i>
            {extractActionsMutation.isPending ? 'Extracting...' : 'Extract action items'}
          </Button>
          
          <Button
            onClick={onQueryClick}
            className="w-full text-left justify-start bg-white border border-gray-200 hover:border-blue-600 text-gray-900 hover:text-blue-900 h-auto p-3"
          >
            <i className="fas fa-search text-blue-600 mr-3"></i>
            Find related documents
          </Button>
          
          <Button
            onClick={onQueryClick}
            className="w-full text-left justify-start bg-white border border-gray-200 hover:border-blue-600 text-gray-900 hover:text-blue-900 h-auto p-3"
          >
            <i className="fas fa-balance-scale text-blue-600 mr-3"></i>
            Ask a question
          </Button>
        </div>
        
        {/* AI Response */}
        {aiResponse && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
                <div className="flex-1 text-sm">
                  <div className="whitespace-pre-wrap text-gray-900">{aiResponse}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recent AI interactions placeholder */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Recent Questions</h4>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-3">
              <p className="font-medium mb-1 text-sm">Ask questions about this document</p>
              <p className="text-gray-600 text-xs">Use the search button to query across all your documents with AI</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
