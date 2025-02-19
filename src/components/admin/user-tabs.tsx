// src/components/UsersPageTabs.tsx
import React from 'react';
import { Tabs as TabsPrimitive, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTable } from './users-table';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row']

interface TabsProps {
  activeTab: string;
  users: Profile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  status: string;
}

export function Tabs({
  activeTab,
  users,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  status,
}: TabsProps) {
  const updateSearchParams = (newTab?: string, newSearch?: string, newStatus?: string, newPage?: number) => {
    const params = new URLSearchParams(window.location.search);

    if (newTab !== undefined) {
      newTab !== 'all' ? params.set('tab', newTab) : params.delete('tab');
    }
    if (newSearch !== undefined) {
      newSearch ? params.set('search', newSearch) : params.delete('search');
    }
    // if (newStatus !== undefined) {
    //   newStatus !== 'all' ? params.set('status', newStatus) : params.delete('status');
    // }
    if (newPage !== undefined) {
      newPage > 0 ? params.set('page', newPage.toString()) : params.delete('page');
    }

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return (
    <TabsPrimitive value={activeTab} onValueChange={(newTab) => updateSearchParams(newTab, undefined, undefined, 0)}>
      <TabsList>
        <TabsTrigger value="all">All Profiles</TabsTrigger>
        <TabsTrigger value="new">Needs Approval</TabsTrigger>
        <TabsTrigger value="reported">Reported</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        <UsersTable
          users={users}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          status={status}
          onSearch={(search) => updateSearchParams(undefined, search, undefined, 0)}
          onStatusChange={(newStatus) => updateSearchParams(undefined, undefined, newStatus, 0)}
          onPageChange={(page) => updateSearchParams(undefined, undefined, undefined, page)}
        />
      </TabsContent>
    </TabsPrimitive>
  );
}