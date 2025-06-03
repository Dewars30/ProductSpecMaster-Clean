import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Document } from "@shared/schema";

interface ProductSpecEditorProps {
  documentId: string;
  onBack: () => void;
}

export default function ProductSpecEditor({ documentId, onBack }: ProductSpecEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    onSuccess: (data) => {
      setContent(data.content || "");
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
      console.error('Failed to load document:', error);
      toast({
        title: "Error",
        description: "Failed to load product specification",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newContent: string) => {
      await apiRequest('PUT', `/api/documents/${documentId}`, { content: newContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      setHasUnsavedChanges(false);
      toast({
        title: "Saved",
        description: "Product specification saved successfully",
      });
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
        description: "Failed to save product specification",
        variant: "destructive",
      });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/product-spec/${documentId}/summarize`);
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to summarize product specification",
        variant: "destructive",
      });
    },
  });

  const extractActionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/product-spec/${documentId}/extract-actions`);
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to extract action items",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          saveMutation.mutate(content);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content, hasUnsavedChanges]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(content);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product specification...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && (!document || error)) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product specification not found</h2>
          <p className="text-gray-600 mb-4">The product specification you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{document?.name}</h1>
            <p className="text-sm text-gray-500">
              Last modified: {document?.lastModified ? new Date(document.lastModified).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setIsEditing(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                !isEditing 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                isEditing 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
          </div>
          
          <Button
            onClick={() => setShowAiPanel(!showAiPanel)}
            variant={showAiPanel ? "default" : "outline"}
            size="sm"
            className={showAiPanel ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Assistant
          </Button>
          
          {hasUnsavedChanges && (
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showAiPanel ? 'mr-96' : ''}`}>
          {isEditing ? (
            /* Edit Mode */
            <div className="flex-1 p-8">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full resize-none border-none shadow-none text-base leading-relaxed font-serif focus:ring-0 focus:border-none"
                placeholder="Start writing..."
                style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.7',
                  fontFamily: 'Georgia, serif'
                }}
              />
            </div>
          ) : (
            /* View Mode */
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div 
                  className="prose prose-lg max-w-none"
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.7',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {content ? (
                    <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                      {content}
                    </pre>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Specification</h3>
                      <p className="text-gray-500 mb-4">This product specification doesn't have any content yet.</p>
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        Start Writing
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Panel */}
        {showAiPanel && (
          <div className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h2>
              <p className="text-sm text-gray-600">Get insights and suggestions for this document</p>
            </div>
            
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
                
                <Button
                  variant="outline"
                  onClick={() => summarizeMutation.mutate()}
                  disabled={summarizeMutation.isPending}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-sm">Summarize Specification</div>
                    <div className="text-xs text-gray-500">Get a concise summary</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => extractActionsMutation.mutate()}
                  disabled={extractActionsMutation.isPending}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                    <div className="font-medium text-sm">Extract Action Items</div>
                    <div className="text-xs text-gray-500">Find tasks and next steps</div>
                  </div>
                </Button>
              </div>

              {/* AI Results */}
              {summarizeMutation.data && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{summarizeMutation.data.summary}</p>
                  </CardContent>
                </Card>
              )}

              {extractActionsMutation.data && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Action Items</h4>
                    <div className="space-y-2">
                      {extractActionsMutation.data.actions.map((action: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
