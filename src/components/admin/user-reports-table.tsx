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
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export type UserReport = {
  id: number;
  profile_id: string;
  reason: string;
  details: string;
  reported_by: string;
  report_status: "PENDING" | "RESOLVED" | "CLOSED";
  created_at: string;
  updated_at: string;
  reported_username: string;
  reported_avatar_url: string;
  reporter_username: string;
  reporter_avatar_url: string;
};

interface UserReportsTableProps {
  reports: UserReport[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  status: string;
  searchQuery: string;
}

export function UserReportsTable({
  reports,
  currentPage,
  totalPages,
  totalCount,
  status,
  searchQuery,
}: UserReportsTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentReports, setCurrentReports] = useState<UserReport[]>(reports);
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setCurrentReports(reports);
  }, [reports]);

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

  // Empty handler functions to be implemented
  const handleViewReportDetails = (reportId: number) => {
    window.location.href = `/admin/reported-users/${reportId}`;
  };

  const handleMarkAsResolved = async (reportId: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/reports/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update report status");
      }

      // Update local state
      setCurrentReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? { ...report, report_status: "RESOLVED" }
            : report,
        ),
      );

      setSuccessMessage("Report marked as resolved");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseReport = async (reportId: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/reports/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update report status");
      }

      // Update local state
      setCurrentReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? { ...report, report_status: "CLOSED" }
            : report,
        ),
      );

      setSuccessMessage("Report closed");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: "PENDING" | "RESOLVED" | "CLOSED") => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-500">Resolved</Badge>
        );
      case "CLOSED":
        return <Badge className="bg-gray-500 hover:bg-gray-500">Closed</Badge>;
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-500">Pending</Badge>
        );
    }
  };

  // Truncate text for table display
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
              placeholder="Search reports..."
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
              <SelectItem value="ALL">All Reports</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reported User</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                currentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={report.reported_avatar_url || ""}
                            alt={report.reported_username || "User"}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          {report.reported_username || "Unknown User"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={report.reporter_avatar_url || ""}
                            alt={report.reporter_username || "User"}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">
                          {report.reporter_username || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.report_status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewReportDetails(report.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {report.report_status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleMarkAsResolved(report.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCloseReport(report.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Close Report
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
            Showing {currentReports.length} of {totalCount} reports
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
    </>
  );
}
