import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Trash2,
  Ban,
  User,
  MoreHorizontal,
  ImageIcon,
  Film,
  File,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MODERATION_IMAGE_URL } from "@/lib/consts";
export type UploadType = "avatar" | "profile_upload";
export type FileType = "image" | "video" | "other";

export interface UserUpload {
  id: string; // Constructed ID for the upload
  userId: string; // User ID
  username: string; // Username for display
  url: string; // URL of the upload
  type: UploadType; // Type of upload (avatar or profile_upload)
  fileType: FileType; // Type of file (image, video, other)
  timestamp: string | null; // Timestamp of upload (may be null)
}

interface UserUploadsTableProps {
  uploads: UserUpload[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  uploadType: string;
  searchQuery: string;
}

export function UserUploadsTable({
  uploads,
  currentPage,
  totalPages,
  totalCount,
  uploadType,
  searchQuery,
}: UserUploadsTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUploads, setCurrentUploads] = useState<UserUpload[]>(uploads);
  const [search, setSearch] = useState(searchQuery);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [moderateConfirmId, setModerateConfirmId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setCurrentUploads(uploads);
  }, [uploads]);

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
    newType?: string,
    newSearch?: string,
    newPage?: number,
  ) => {
    const params = new URLSearchParams(window.location.search);

    if (newType !== undefined) {
      newType !== "all" ? params.set("type", newType) : params.delete("type");
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

  // View image in modal
  const handleViewImage = (url: string) => {
    setViewImageUrl(url);
  };

  // Delete image
  const handleDeleteImage = async (uploadId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Find the upload details
      const upload = currentUploads.find((u) => u.id === uploadId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      // Call the appropriate endpoint based on upload type
      const endpoint =
        upload.type === "avatar"
          ? `/api/users/${upload.userId}/avatar/moderate`
          : `/api/users/${upload.userId}/uploads/delete`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: upload.url,
          // For profile uploads, we need to identify which one to delete
          ...(upload.type === "profile_upload" && {
            index: uploadId.split("-").pop(),
          }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete upload");
      }

      // Remove from local state
      setCurrentUploads((prevUploads) =>
        prevUploads.filter((u) => u.id !== uploadId),
      );

      setSuccessMessage(
        `${upload.type === "avatar" ? "Avatar" : "Upload"} has been deleted`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmId(null);
    }
  };

  // Replace with moderation image
  const handleModerateImage = async (uploadId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Find the upload details
      const upload = currentUploads.find((u) => u.id === uploadId);
      if (!upload) {
        throw new Error("Upload not found");
      }

      // Call the appropriate endpoint based on upload type
      const endpoint =
        upload.type === "avatar"
          ? `/api/users/${upload.userId}/avatar/moderate`
          : `/api/users/${upload.userId}/uploads/moderate`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: upload.url,
          // For profile uploads, we need to identify which one to moderate
          ...(upload.type === "profile_upload" && {
            index: uploadId.split("-").pop(),
          }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to moderate upload");
      }

      // Update the URL in local state to the moderation image
      const moderationImageUrl = MODERATION_IMAGE_URL; // Your moderation image path

      setCurrentUploads((prevUploads) =>
        prevUploads.map((u) =>
          u.id === uploadId ? { ...u, url: moderationImageUrl } : u,
        ),
      );

      setSuccessMessage(
        `${upload.type === "avatar" ? "Avatar" : "Upload"} has been moderated`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setModerateConfirmId(null);
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case "video":
        return <Film className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
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
            value={uploadType}
            onValueChange={(value) => updateSearchParams(value, undefined, 0)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Uploads</SelectItem>
              <SelectItem value="avatars">Avatars Only</SelectItem>
              <SelectItem value="profile_uploads">
                Profile Uploads Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentUploads.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
              No uploads found
            </div>
          ) : (
            currentUploads.map((upload) => (
              <Card key={upload.id} className="overflow-hidden">
                <div
                  className="aspect-square relative bg-muted cursor-pointer group"
                  onClick={() => handleViewImage(upload.url)}
                >
                  {upload.fileType === "image" ? (
                    <img
                      src={upload.url}
                      alt={`${upload.username}'s ${upload.type}`}
                      className="w-full h-full object-cover"
                    />
                  ) : upload.fileType === "video" ? (
                    <div className="flex items-center justify-center h-full">
                      <Film className="h-12 w-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <File className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Overlay with quick actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewImage(upload.url);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(upload.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModerateConfirmId(upload.id);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardFooter className="p-2 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs truncate">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[6rem]">
                      {upload.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getFileTypeIcon(upload.fileType)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {upload.type === "avatar" ? "Avatar" : "Upload"}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {currentUploads.length} of {totalCount} uploads
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

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!viewImageUrl}
        onOpenChange={(open) => !open && setViewImageUrl(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            <img
              src={viewImageUrl || ""}
              alt="Preview"
              className="w-full h-auto object-contain"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImageUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this upload?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the image from the user's profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmId && handleDeleteImage(deleteConfirmId)
              }
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete Upload"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Moderate Confirmation Dialog */}
      <AlertDialog
        open={!!moderateConfirmId}
        onOpenChange={(open) => !open && setModerateConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace with moderation image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current image with a moderation placeholder.
              The original image will still be in storage but won't be visible
              to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                moderateConfirmId && handleModerateImage(moderateConfirmId)
              }
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? "Moderating..." : "Replace Image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
