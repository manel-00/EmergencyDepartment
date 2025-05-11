import React from 'react';

const DocumentCardSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl overflow-hidden border border-gray-100 mt-16">
      <div className="bg-blue-600 p-6 text-white">
        <div className="h-9 w-64 bg-blue-500 rounded-md animate-pulse"></div>
      </div>
      
      <div className="p-8">
        {/* User Profile Section Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-200 pb-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          <div className="text-center md:text-left w-full md:w-64">
            <div className="h-8 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Document Details Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded-md mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Document Info Item Skeleton - repeated 3 times */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-full">
                  <div className="h-4 w-16 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Content Section Skeleton */}
          <div className="col-span-full">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-full">
                <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 mt-1 border border-gray-100 h-40">
              <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
        <div className="flex justify-end gap-3">
          <div className="w-36 h-9 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-24 h-9 bg-blue-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCardSkeleton;