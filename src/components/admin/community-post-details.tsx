import React, { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Link as LinkIcon,
  Image as ImageIcon,
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
import { deletePost } from "@/lib/supabase/community-posts";
import type { CommunityPost } from "@/lib/supabase/community-posts";

interface CommunityPostDetailsProps {
  post: CommunityPost;
}

export function CommunityPostDetails({ post }: CommunityPostDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(new Request(""), {} as any, post.id);
      window.location.href = "/admin/community-posts";
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Details Section */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Title" value={post.title} isBold />
            {post.description && (
              <DetailItem label="Description" value={post.description} />
            )}
            {post.associated_link && (
              <DetailItem
                label="Associated Link"
                value={
                  <a
                    href={post.associated_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline overflow-hidden text-ellipsis"
                  >
                    {post.associated_link}
                  </a>
                }
                icon={<LinkIcon className="h-4 w-4 mr-2" />}
              />
            )}
            {post.body && (
              <DetailItem
                label="Body"
                value={
                  <div
                    className="prose prose-sm mt-2"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                  />
                }
              />
            )}
            {post.cover_image && (
              <DetailItem
                label="Image URL"
                value={
                  <a
                    href={post.cover_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline overflow-hidden text-ellipsis"
                  >
                    {post.cover_image}
                  </a>
                }
                icon={<ImageIcon className="h-4 w-4 mr-2" />}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Section */}
      <div className="space-y-6">
        {/* Cover Image Preview */}
        {post.cover_image && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
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
            <DetailItem
              label="Created At"
              value={format(new Date(post.created_at), "MMMM d, yyyy")}
              icon={<CalendarDays className="h-4 w-4 mr-2" />}
            />
            <DetailItem label="ID" value={post.id} isMono />
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
              onClick={() =>
                (window.location.href = `/admin/community-posts/${post.id}/edit`)
              }
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Post
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the post "{post.title}". This
                    action cannot be undone.
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

function DetailItem({
  label,
  value,
  icon,
  isBold = false,
  isMono = false,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  isBold?: boolean;
  isMono?: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex items-center mt-1">
        {icon}
        <p
          className={`
            ${isBold ? "text-lg font-semibold" : ""}
            ${isMono ? "text-sm font-mono" : ""}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
