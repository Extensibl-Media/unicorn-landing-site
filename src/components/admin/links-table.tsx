import React, { useEffect, useReducer, useState } from "react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { PostgrestError } from "@supabase/supabase-js";
import { Alert } from "../ui/alert";

type Link = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  created_at: string;
  active: boolean;
  order?: number | null;
  image: string | null;
};

type LinksProps = {
  links: Link[];
};

export default function LinksTable({ links }: LinksProps) {
  const [linkData, setLinkData] = useState<Link[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newLink, setNewLink] = useState<Partial<Link>>({
    title: "",
    description: "",
    url: "",
    image: null,
    active: true,
  });
  const supabase = createClient();

  useEffect(() => {
    setIsLoading(true);
    try {
      setLinkData(links);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [links]);

  useEffect(() => {
    console.log(linkData);
  }, [linkData]);

  const handleInputChange = (event: any) => {
    if (!event.target) {
      return;
    }
    const { name, value } = event.target;
    setNewLink((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteLink = () => {};
  const handleCreateNewLink = async () => {
    setIsSubmitting(true);
    setError(null);

    console.log(newLink);

    try {
      if (!newLink.title?.length || !newLink.url?.length) {
        setError("Please fill in all required fields.");
        return;
      }
      const { data, error } = await supabase.from("lib_links").insert([
        {
          title: newLink.title,
          description: newLink.description,
          url: newLink.url as string,
          active: true,
          image:
            "https://api.unicornlanding.com/storage/v1/object/public/brand-assets//link-icon.svg",
        },
      ]);

      console.log({ data, error });

      if (error) throw error;

      // Update local state
      setLinkData((prev) => [
        ...prev,
        {
          ...newLink,
          id: Date.now(), // Temporary ID until the server responds
          created_at: new Date().toISOString(),
          active: true,
        } as Link,
      ]);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setIsCreateDialogOpen(false);
      setNewLink({
        title: "",
        description: "",
        url: "",
        image: null,
        active: true,
      });
    }
  };

  const handleToggleLinkActive = async (link: Link) => {
    try {
      const { error } = await supabase
        .from("lib_links")
        .update({ active: !link.active })
        .eq("id", link.id);

      if (error) throw error;

      // Update local state
      setLinkData(
        linkData.map((l) =>
          l.id === link.id ? { ...link, active: !link.active } : link,
        ),
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  return isLoading ? (
    <div className="flex flex-col gap-2">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div className="bg-gradient-to-r from-gray-50 to-gray-200 p-12 rounded-lg" />
        ))}
    </div>
  ) : (
    <>
      <div className="flex justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links</h1>
          <p className="text-muted-foreground">
            View and manage Link In Bio links.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus /> Create New Link
        </Button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4">
          {error}
        </div>
      )}
      {linkData.length === 0 ? (
        <div className="w-full p-8 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center gap-4">
          <p>No Links created yet.</p>
          <p className="text-sm text-gray-400">
            Create lnks to display in your Links page
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus /> Create New Link
          </Button>
        </div>
      ) : (
        <div>
          {linkData.map((link) => (
            <p>{link.title}</p>
          ))}
        </div>
      )}

      {/* Create Link Dialog */}
      <AlertDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Link</AlertDialogTitle>
            <AlertDialogDescription>
              Add the information for the new link you want to create.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="">
            <Label>Title</Label>
            <Input
              name="title"
              value={newLink.title}
              onChange={handleInputChange}
              placeholder="Link Title"
            />
          </div>
          <div className="">
            <Label>Description</Label>
            <Input
              name="description"
              value={newLink.description}
              onChange={handleInputChange}
              placeholder="Link Description"
            />
          </div>
          <div className="">
            <Label>URL</Label>
            <Input
              name="url"
              type="url"
              value={newLink.url}
              onChange={handleInputChange}
              placeholder="Link URL"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateNewLink}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? "Creating..." : "Create Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Link Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this link?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
