import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash,
  ArrowUpRightSquare,
  SquareCheckBig,
  Rocket,
  Slash,
  SquareSlash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { updatePostClient, type Post } from "@/lib/supabase/blog";
import { cn } from "@/lib/utils";

interface PostsTableProps {
  posts: Post[];
  sortBy: string;
  sortOrder: string;
}

export function PostsTable({ posts, sortBy, sortOrder }: PostsTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{post.title}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    post.status === "published" && "bg-green-500",
                    post.status === "draft" && "bg-yellow-500",
                    post.status === "archived" && "bg-gray-500",
                  )}
                >
                  {post.status}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {post?.tags?.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(post.updated_at as string), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {post.status === "published" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          updatePostClient(post.id, { status: "draft" })
                        }
                      >
                        <SquareSlash className="mr-2 h-4 w-4" />
                        Unpublish
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          updatePostClient(post.id, { status: "published" })
                        }
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = `/admin/blog/${post.id}/edit`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = `/admin/blog/${post.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    {post.status === "published" && (
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `/blog/${post.slug}`)
                        }
                      >
                        <ArrowUpRightSquare className="mr-2 h-4 w-4" />
                        View Live
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this post?")
                        ) {
                          // Add delete functionality
                        }
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
