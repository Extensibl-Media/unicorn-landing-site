import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: string;
  name: string;
  url: string;
  bucket: string;
  created_at: string;
  size: number;
  type: string;
  metadata?: {
    width?: number;
    height?: number;
    owner?: string;
    content_type?: string;
  };
}

export function ContentModerationTable() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchContent();
  }, [page, filter]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // This will be replaced with your actual API endpoint
      const response = await fetch(
        `/api/content-moderation?page=${page}&filter=${filter}&search=${search}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch content items");
      }

      const data = await response.json();
      setContentItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching content",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchContent();
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(`/api/content-moderation/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      // Update local state
      setContentItems(
        contentItems.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );

      // If viewing the item in the dialog, update that too
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating content status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/content-moderation/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
      }

      // Remove from local state
      setContentItems(contentItems.filter((item) => item.id !== id));

      // Close dialog if the deleted item was being viewed
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Error deleting content:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
        <CardDescription>
          Review and moderate user-uploaded content from storage buckets
        </CardDescription>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 mt-4">
          <div className="flex flex-1">
            <Input
              placeholder="Search by filename or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-r-none"
            />
            <Button
              variant="default"
              onClick={handleSearch}
              className="rounded-l-none"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading content items...</div>
        ) : contentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No content items found
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table className="bg-white rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{item.name}</DialogTitle>
                              <DialogDescription>
                                Uploaded to {item.bucket} on{" "}
                                {formatDate(item.created_at)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="max-h-[60vh] overflow-auto">
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="max-w-full h-auto rounded-md"
                                />
                              </div>
                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Size:
                                  </span>
                                  <span>{formatFileSize(item.size)}</span>
                                </div>
                                {item.metadata?.width &&
                                  item.metadata?.height && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Dimensions:
                                      </span>
                                      <span>
                                        {item.metadata.width} ×{" "}
                                        {item.metadata.height}
                                      </span>
                                    </div>
                                  )}
                                {item.metadata?.owner && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Uploaded by:
                                    </span>
                                    <span>{item.metadata.owner}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Status:
                                  </span>
                                  <span>{getStatusBadge(item.status)}</span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="flex justify-between">
                              <div>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(item.id)}
                                  className="mr-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                              <div>
                                <DialogClose asChild>
                                  <Button variant="outline" className="mr-2">
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleStatusChange(item.id, "rejected")
                                  }
                                  className="mr-2"
                                  disabled={item.status === "rejected"}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  variant="default"
                                  onClick={() =>
                                    handleStatusChange(item.id, "approved")
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={item.status === "approved"}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.type}
                        </div>
                      </TableCell>
                      <TableCell>{item.bucket}</TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell>{formatFileSize(item.size)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() =>
                              handleStatusChange(item.id, "approved")
                            }
                            disabled={item.status === "approved"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() =>
                              handleStatusChange(item.id, "rejected")
                            }
                            disabled={item.status === "rejected"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
