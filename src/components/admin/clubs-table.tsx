// src/components/admin/clubs-table.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Eye, MoreHorizontal, Search, Star } from "lucide-react";
import type { Database } from '@/types/supabase';

type Club = Database['public']['Tables']['clubs']['Row']

interface ClubsTableProps {
  clubs: Club[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}
export function ClubsTable({
  clubs,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
}: ClubsTableProps) {
  const [search, setSearch] = useState(searchQuery);
  const updateSearchParams = (newSearch?: string, newPage?: number) => {
    const params = new URLSearchParams(window.location.search);

    if (newSearch !== undefined) {
      newSearch ? params.set('search', newSearch) : params.delete('search');
    }

    if (newPage !== undefined) {
      newPage > 0 ? params.set('page', newPage.toString()) : params.delete('page');
    }

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== searchQuery) {
        updateSearchParams(search);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handlePageChange = React.useCallback((newPage: number) => updateSearchParams(undefined, newPage), [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Club Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No clubs found
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {club.cover_image && (
                        <img
                          src={club.cover_image}
                          alt={club.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{club.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{club.address}</div>
                      <div className="text-muted-foreground">
                        {club.city}, {club.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{club.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{club.total_reviews || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/admin/clubs/${club.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {clubs.length} of {totalCount} clubs
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}