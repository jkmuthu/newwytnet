import React from 'react';
import SearchInterface from '@/components/SearchInterface';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SearchInterface />
      </div>
    </div>
  );
}