import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Document } from "@shared/schema";
import { useState } from "react";
import QueryInterface from "@/components/query-interface";
import GoogleDriveStatus from "@/components/google-drive-status";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPane, setSelectedPane] = useState<'specifications' | 'query' | 'editor'>('specifications');

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
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
      }
    },
  });

  const handleSyncSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
  };

  const filteredDocuments = documents?.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">ProductSpecMaster</span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setSelectedPane('specifications')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPane === 'specifications' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Specifications
            </button>
            <button 
              onClick={() => setSelectedPane('query')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPane === 'query' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Query
            </button>
            <button 
              onClick={() => setSelectedPane('editor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPane === 'editor' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Editor
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/api/logout'}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Specifications Pane */}
        {selectedPane === 'specifications' && (
          <div className="flex-1 flex">
            {/* Left Sidebar - Specifications List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-100 space-y-4">
                {/* Google Drive Status */}
                <GoogleDriveStatus onSyncSuccess={handleSyncSuccess} />
                
                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search product specifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {documentsLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredDocuments.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => window.location.href = `/product-spec/${doc.id}`}
                        className="group p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {doc.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'Unknown date'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {doc.content ? doc.content.substring(0, 100) + '...' : 'No preview available'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No product specifications found</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {searchQuery ? 'Try a different search term' : 'Sync your Google Drive to get started'}
                    </p>
                    {!searchQuery && (
                      <GoogleDriveStatus onSyncSuccess={handleSyncSuccess} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Welcome Section */}
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-md text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to ProductSpecMaster</h2>
                  <p className="text-gray-600 mb-6">Select a product specification to start editing, or use the Query tab to search across all your specifications with AI.</p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setSelectedPane('query')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Ask AI a Question
                    </Button>
                    <div className="w-full">
                      <GoogleDriveStatus onSyncSuccess={handleSyncSuccess} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Query Pane */}
        {selectedPane === 'query' && (
          <div className="flex-1 bg-white">
            <QueryInterface onClose={() => setSelectedPane('specifications')} />
          </div>
        )}

        {/* Editor Pane */}
        {selectedPane === 'editor' && (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Specification Editor</h2>
              <p className="text-gray-600 mb-6">Select a product specification from the Specifications tab to start editing with AI assistance.</p>
              <Button 
                onClick={() => setSelectedPane('specifications')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Browse Specifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}