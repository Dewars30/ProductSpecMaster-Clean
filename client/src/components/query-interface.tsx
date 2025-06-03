import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface QueryInterfaceProps {
  onClose: () => void;
}

interface QueryResponse {
  answer: string;
  sources: Array<{
    documentName: string;
    documentId: number;
    snippet: string;
    relevance: number;
  }>;
}

export default function QueryInterface({ onClose }: QueryInterfaceProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const queryMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const res = await apiRequest('POST', '/api/query', { query: queryText });
      return res.json() as Promise<QueryResponse>;
    },
    onSuccess: (data) => {
      setResponse(data);
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
        description: "Failed to process query",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!query.trim()) return;
    queryMutation.mutate(query.trim());
  };

  const quickQueries = [
    "What is our Q4 strategy?",
    "Show me fundraising documents",
    "What are the key action items?",
    "Who is responsible for product launch?"
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fas fa-brain text-blue-600 mr-2"></i>
            Ask AI Assistant
          </DialogTitle>
          <p className="text-gray-600">Search across all your documents with natural language</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Query Input */}
          <div className="relative">
            <Textarea
              placeholder="Ask anything about your documents... e.g., 'What's our Q4 strategy?' or 'Show me fundraising documents'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || queryMutation.isPending}
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700"
            >
              {queryMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </Button>
          </div>

          {/* AI Response Area */}
          {response && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <i className="fas fa-brain text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed">{response.answer}</p>
                  </div>
                  
                  {/* Source citations */}
                  {response.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h4 className="font-medium text-sm text-blue-900 mb-3 flex items-center">
                        <i className="fas fa-link text-blue-600 mr-2"></i>
                        Sources
                      </h4>
                      <div className="space-y-2">
                        {response.sources.map((source, index) => (
                          <Card 
                            key={index}
                            className="cursor-pointer hover:bg-white transition-colors border-blue-200"
                            onClick={() => window.location.href = `/document/${source.documentId}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <i className="fas fa-file-alt text-blue-600 text-sm"></i>
                                <span className="text-sm font-medium text-blue-800">{source.documentName}</span>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {Math.round(source.relevance * 100)}% match
                                </span>
                              </div>
                              <p className="text-xs text-blue-700">{source.snippet}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {queryMutation.isPending && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your documents...</p>
            </div>
          )}

          {/* Quick suggestions */}
          {!response && !queryMutation.isPending && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickQueries.map((quickQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setQuery(quickQuery);
                      queryMutation.mutate(quickQuery);
                    }}
                    className="text-left justify-start h-auto p-4"
                  >
                    <i className="fas fa-search text-blue-600 mr-3"></i>
                    {quickQuery}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
