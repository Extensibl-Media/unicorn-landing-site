import React, { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  Radio,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Trash,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deletePodcast } from "@/lib/supabase/podcasts";
import type { Podcast } from "@/lib/supabase/podcasts";

interface PodcastDetailsProps {
  podcast: Podcast;
}

export function PodcastDetails({ podcast }: PodcastDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to format duration from seconds to hh:mm:ss
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle podcast deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Using browser client function since we're in a client component
      await deletePodcast(
        new Request(""), // Placeholder, will be ignored in client function
        {} as any, // Placeholder, will be ignored in client function
        podcast.id,
      );

      // toast({
      //   title: "Podcast Deleted",
      //   description: `${podcast.title} has been deleted successfully`,
      //   variant: "default",
      // });

      // Redirect to podcasts list
      window.location.href = "/admin/podcasts";
    } catch (error) {
      console.error("Error deleting podcast:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to delete podcast. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info Column */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Title
              </h3>
              <p className="text-lg font-semibold">{podcast.title}</p>
            </div>

            {podcast.subtitle && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Subtitle
                </h3>
                <p>{podcast.subtitle}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Channel
                </h3>
                <Badge className="mt-1" variant="outline">
                  {podcast.channel_name}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Duration
                </h3>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatDuration(podcast.duration)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                External URL
              </h3>
              <div className="flex items-center mt-1">
                <LinkIcon className="h-4 w-4 mr-2" />
                <a
                  href={podcast.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline overflow-hidden text-ellipsis"
                >
                  {podcast.external_url}
                </a>
              </div>
            </div>

            {podcast.image_url && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Image URL
                </h3>
                <div className="flex items-center mt-1">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <a
                    href={podcast.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline overflow-hidden text-ellipsis"
                  >
                    {podcast.image_url}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-6">
        {/* Image Preview */}
        {podcast.image_url && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden">
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-image.jpg";
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {podcast.release_date && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Release Date
                </h3>
                <div className="flex items-center mt-1">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {format(new Date(podcast.release_date), "MMMM d, yyyy")}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Created At
              </h3>
              <div className="flex items-center mt-1">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(new Date(podcast.created_at), "MMMM d, yyyy")}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p className="text-sm font-mono">{podcast.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.open(podcast.external_url, "_blank")}
            >
              <Play className="h-4 w-4 mr-2" />
              Listen External
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={() =>
                (window.location.href = `/admin/podcasts/${podcast.id}/edit`)
              }
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Podcast
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Podcast
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the podcast "{podcast.title}".
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
