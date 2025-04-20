import React, { useState, useEffect } from "react";
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
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Image,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export type VerificationRequest = {
  id: number;
  user_id: string;
  verified: boolean;
  verification_image: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string;
    email: string;
  };
};

interface VerificationRequestsTableProps {
  requests: VerificationRequest[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  status: string;
  searchQuery: string;
}

export function VerificationRequestsTable({
  requests,
  currentPage,
  totalPages,
  totalCount,
  status,
  searchQuery,
}: VerificationRequestsTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [currentRequests, setCurrentRequests] =
    useState<VerificationRequest[]>(requests);
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== searchQuery) {
        updateSearchParams(undefined, search, undefined);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Navigation functions
  const updateSearchParams = (
    newStatus?: string,
    newSearch?: string,
    newPage?: number,
  ) => {
    const params = new URLSearchParams(window.location.search);

    if (newStatus !== undefined) {
      newStatus !== "ALL"
        ? params.set("status", newStatus)
        : params.delete("status");
    }

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

  const handleApprove = async (requestId: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // First, find the request to get the user ID
      const request = currentRequests.find((req) => req.id === requestId);
      if (!request) {
        throw new Error("Verification request not found");
      }

      // Update verification status for the user via the existing endpoint
      const response = await fetch(`/api/users/${request.user_id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verified: true,
          verification_request_id: requestId,
          verification_status: "APPROVED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify user");
      }

      // Update local state
      setCurrentRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: "APPROVED" } : req,
        ),
      );

      setSuccessMessage("User verified successfully");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle denial of verification request
  const handleDeny = async (requestId: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // First, find the request to get the user ID
      const request = currentRequests.find((req) => req.id === requestId);
      if (!request) {
        throw new Error("Verification request not found");
      }

      // Update verification status for the user via the existing endpoint
      const response = await fetch(`/api/users/${request.user_id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verified: false,
          verification_request_id: requestId,
          verification_status: "DENIED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to update verification status",
        );
      }

      // Update local state
      setCurrentRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: "DENIED" } : req,
        ),
      );

      setSuccessMessage("Verification request denied");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setViewImageUrl(imageUrl);
  };

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "DENIED") => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-500">Approved</Badge>
        );
      case "DENIED":
        return <Badge className="bg-red-500 hover:bg-red-500">Denied</Badge>;
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-500">Pending</Badge>
        );
    }
  };

  return (
    <>
      {/* Status messages */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => updateSearchParams(value, undefined, 0)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="DENIED">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No verification requests found
                  </TableCell>
                </TableRow>
              ) : (
                currentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={request.profiles?.avatar_url || ""}
                            alt={request.profiles?.username || "User"}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.profiles?.username || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {request.user_id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewImage(request.verification_image)
                            }
                          >
                            <Image className="mr-2 h-4 w-4" />
                            View Image
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/admin/users/${request.user_id}`}>
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </a>
                          </DropdownMenuItem>

                          {request.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeny(request.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Deny
                              </DropdownMenuItem>
                            </>
                          )}
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
            Showing {currentRequests.length} of {totalCount} verification
            requests
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSearchParams(undefined, undefined, currentPage - 1)
              }
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSearchParams(undefined, undefined, currentPage + 1)
              }
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Image preview dialog */}
      <Dialog
        open={!!viewImageUrl}
        onOpenChange={(open) => !open && setViewImageUrl(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Verification Image</DialogTitle>
            <DialogDescription>
              Review the submitted verification image
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 relative overflow-hidden rounded-md bg-muted flex items-center justify-center  max-w-[200px] mx-auto">
            {viewImageUrl ? (
              <img
                src={viewImageUrl}
                alt="Verification"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground">No image available</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImageUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
