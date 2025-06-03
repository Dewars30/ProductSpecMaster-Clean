import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Document } from "@shared/schema";
import { useState } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const filteredDocuments = documents?.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10) || [];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
      isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-80'
    }`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
              TypeAI
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <i className="fas fa-times text-gray-500"></i>
            </Button>
          </div>
          
          {!isCollapsed && (
            <>
              <Button className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors duration-200 font-medium mb-4">
                <i className="fas fa-plus mr-2"></i>
                New Document
              </Button>
              
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </>
          )}
        </div>
        
        {/* Document Categories */}
        <div className="flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="p-6 space-y-6">
              {/* Recent Documents */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-clock text-gray-400 mr-2"></i>
                  Recent Documents
                </h3>
                
                <div className="space-y-2">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <Card 
                        key={doc.id}
                        className="group cursor-pointer p-3 hover:bg-gray-50 transition-colors duration-200 border-0 shadow-none"
                        onClick={() => window.location.href = `/document/${doc.id}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className={`fas ${doc.mimeType?.includes('pdf') ? 'fa-file-pdf text-red-600' : 'fa-file-alt text-blue-600'} text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-folder-open text-2xl text-gray-300 mb-2 block"></i>
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'No documents found' : 'No documents yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Suggested */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-lightbulb text-gray-400 mr-2"></i>
                  AI Suggested
                </h3>
                <div className="space-y-2">
                  <Card className="group cursor-pointer p-3 hover:bg-gray-50 transition-colors duration-200 border border-amber-200 bg-amber-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-star text-amber-600 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Frequently Referenced
                        </p>
                        <p className="text-xs text-amber-700">Based on your queries</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="p-4 space-y-4">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <i className="fas fa-file text-gray-500"></i>
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <i className="fas fa-search text-gray-500"></i>
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <i className="fas fa-plus text-gray-500"></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
