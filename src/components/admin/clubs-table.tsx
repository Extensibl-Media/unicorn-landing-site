// src/components/admin/clubs-table.tsx
import React, { useCallback, useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Eye, MoreHorizontal, Search, Star, Trash2 } from "lucide-react";
import type { Database } from "@/types/supabase";
import { DeleteClubModal } from "./delete-club-modal";

type Club = Database["public"]["Tables"]["clubs"]["Row"];

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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clubId?: number;
    clubName?: string;
  }>({
    isOpen: false,
    clubId: null,
    clubName: null,
  });
  const [localClubs, setLocalClubs] = useState<Club[]>(clubs);
  useEffect(() => {
    setLocalClubs(clubs);
  }, [clubs]);
  const updateSearchParams = (newSearch?: string, newPage?: number) => {
    const params = new URLSearchParams(window.location.search);

    if (newSearch !== undefined) {
      newSearch ? params.set("search", newSearch) : params.delete("search");
    }

    if (newPage !== undefined) {
      newPage > 0
        ? params.set("page", newPage.toString())
        : params.delete("page");
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

  const handlePageChange = React.useCallback(
    (newPage: number) => updateSearchParams(undefined, newPage),
    [],
  );

  const handleDeleteClick = (clubId: number, clubName: string) => {
    setDeleteModal({
      isOpen: true,
      clubId,
      clubName,
    });
  };

  const handleDeleteSuccess = () => {
    // Remove the deleted club from the local state to avoid a page refresh
    setLocalClubs((prevClubs) =>
      prevClubs.filter((club) => club.id !== deleteModal?.clubId),
    );
    setDeleteModal({ isOpen: false });
  };

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
        <Table className="bg-white rounded-md">
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
            {localClubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No clubs found
                </TableCell>
              </TableRow>
            ) : (
              localClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      {club.cover_image && (
                        <a
                          className="shrink-0"
                          href={`/admin/clubs/${club.id}`}
                        >
                          <img
                            src={club.cover_image}
                            alt={club.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        </a>
                      )}
                      <div>
                        <a href={`/admin/clubs/${club.id}`}>
                          <div className="font-medium">{club.name}</div>
                        </a>
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
                        <DropdownMenuItem asChild>
                          <a href={`/admin/clubs/${club.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(club.id, club.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
          Showing {localClubs.length} of {totalCount} clubs
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
      {/* Delete Confirmation Modal */}

      <DeleteClubModal
        clubId={deleteModal?.clubId}
        clubName={deleteModal?.clubName}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(undefined)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
