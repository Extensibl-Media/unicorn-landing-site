// src/components/UsersTable.tsx
import React, { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRightSquare,
  BadgeCheck,
  Eye,
  MoreHorizontal,
  Pencil,
  Rocket,
  Search,
  SquareCheckBig,
  Trash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import AVATAR_FALLBACK from "src/assets/images/avatar-fallback.png";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UsersTableProps {
  users: Profile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  status: string;
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;
  onPageChange: (page: number) => void;
}

export function UsersTable({
  users,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  status,
  onSearch,
  onStatusChange,
  onPageChange,
}: UsersTableProps) {
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== searchQuery) {
        onSearch(search);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile Image</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              users.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <img
                      className="w-12 h-12 object-cover rounded-md"
                      src={profile.avatar_url || AVATAR_FALLBACK.src}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <p>{profile.username ?? "{No Username}"}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        profile.approved
                          ? "bg-green-500 hover:bg-green-500"
                          : "bg-yellow-500 hover:bg-yellow-500",
                      )}
                    >
                      {profile.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {profile.verified ? <BadgeCheck color="#f72ea2" /> : null}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!profile.approved && (
                          <DropdownMenuItem
                            onClick={() => console.log("approve user")}
                          >
                            <SquareCheckBig className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/admin/users/${profile.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this post?')) {
                              // Add delete functionality
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem> */}
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
          Showing {users.length} of {totalCount} profiles
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
