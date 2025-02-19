import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Search, MoreHorizontal, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import type { Database } from "@/types/supabase";
import { Badge } from "../ui/badge";

export type Ticket = Database['public']['Tables']['support_tickets']['Row']

interface TicketsTableProps {
  tickets: Ticket[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

export function TicketsTable({
  tickets,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
}: TicketsTableProps) {
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

  const handlePageChange = useCallback((newPage: number) =>
    updateSearchParams(undefined, newPage), []);

  const getStatusIcon = (status: boolean) => {
    switch (status) {
      case false: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case true: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: boolean) => {
    switch (status) {

      case false:
        return <Badge>In   Progress</Badge>;
      case true:
        return <Badge>Resolved</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
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
              <TableHead>ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Priority</TableHead> */}
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono">{ticket.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.content?.substring(0, 100)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.resolved)}
                      {getStatusBadge(ticket.resolved)}
                    </div>
                  </TableCell>
                  {/* <TableCell>{getPriorityBadge(ticket.priority)}</TableCell> */}
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(ticket.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/admin/tickets/${ticket.id}`}
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
          Showing {tickets.length} of {totalCount} tickets
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