import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Plus, GripVertical, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema with Zod
const linkFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof linkFormSchema>;

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

// Sortable link item component
const SortableLink = ({
  link,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  link: Link;
  onToggleActive: (link: Link) => void;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none flex gap-2 flex-col sm:flex-row sm:items-center justify-between flex-wrap p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all ${!link.active ? "opacity-60" : ""}`}
    >
      <div className="flex items-center grow">
        <div
          className="mr-3 text-gray-400 cursor-move"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>

        <div className="flex items-center">
          {link.image ? (
            <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
              <img
                src={link.image}
                alt={link.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
              <ExternalLink size={18} className="text-gray-500" />
            </div>
          )}

          <div>
            <h3 className="font-medium">{link.title}</h3>
            {link.description && (
              <p className="text-sm text-gray-500">{link.description}</p>
            )}
            <div className="text-xs text-gray-400 mt-1">
              <span className="block sm:inline truncate max-w-[200px]">
                {link.url}
              </span>
              {link.order !== null && (
                <span className="sm:ml-2 hidden sm:inline">
                  Order: {link.order}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end">
        <Button
          variant="outline"
          size="sm"
          className={`px-3 py-1 h-8 ${link.active ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"}`}
          onClick={() => onToggleActive(link)}
        >
          {link.active ? "Active" : "Inactive"}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(link)}
        >
          <Edit size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700"
          onClick={() => onDelete(link)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
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
  const [isDirty, setIsDirty] = useState(false);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      image: "",
      active: true,
    },
  });

  useEffect(() => {
    setIsLoading(true);
    try {
      // Sort links by order
      const sortedLinks = [...links].sort((a, b) => {
        // Handle null/undefined order values
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
      setLinkData(sortedLinks);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [links]);

  // Reset form when opening/closing dialog or switching between create/edit modes
  useEffect(() => {
    if (isCreateDialogOpen) {
      if (isEditMode && selectedLink) {
        form.reset({
          title: selectedLink.title,
          description: selectedLink.description || "",
          url: selectedLink.url,
          image: selectedLink.image || "",
          active: selectedLink.active,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          url: "",
          image: "",
          active: true,
        });
      }
    }
  }, [isCreateDialogOpen, isEditMode, selectedLink, form]);

  const handleSubmitLink = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    console.log("Submitting link:", values);

    try {
      let response;

      if (isEditMode && selectedLink) {
        console.log("editing link");
        // Edit existing link
        response = await fetch(`/api/links/${selectedLink.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedLink.id,
            title: values.title,
            description: values.description || null,
            url: values.url,
            image: values.image || null,
            active: values.active,
          }),
        });

        const { data, error: responseError } = await response.json();

        console.log({ data, responseError });

        if (responseError) {
          throw new Error(responseError.message);
        }

        // Update local state
        setLinkData(
          linkData.map((link) =>
            link.id === selectedLink.id ? (data as Link) : link,
          ),
        );

        // Only close dialog and reset form on success
        setIsCreateDialogOpen(false);
        setSelectedLink(null);
        setIsEditMode(false);
        form.reset();
      } else {
        // Create new link
        // Calculate the highest order value for new link placement
        const highestOrder =
          linkData.length > 0
            ? Math.max(...linkData.map((link) => link.order ?? 0)) + 100
            : 100;

        response = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: values.title,
            description: values.description || null,
            url: values.url,
            active: values.active,
            order: highestOrder,
            image:
              values.image ||
              "https://api.unicornlanding.com/storage/v1/object/public/brand-assets//link-icon.svg",
          }),
        });

        const { data, error: responseError } = await response.json();

        if (responseError) {
          throw new Error(responseError.message);
        }

        // Update local state
        setLinkData((prev) => [...prev, data as Link]);

        // Only close dialog and reset form on success
        setIsCreateDialogOpen(false);
        setSelectedLink(null);
        setIsEditMode(false);
        form.reset();
      }
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLinkActive = async (link: Link) => {
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: link.id, active: !link.active }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message);
      }

      // Update local state
      setLinkData(
        linkData.map((l) =>
          l.id === link.id ? { ...l, active: !link.active } : l,
        ),
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditLink = (link: Link) => {
    setSelectedLink(link);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteLinkClick = (link: Link) => {
    setSelectedLink(link);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLink = async () => {
    if (!selectedLink) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/links/${selectedLink.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message);
      }

      // Update local state
      setLinkData(linkData.filter((link) => link.id !== selectedLink.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setSelectedLink(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLinkData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setIsDirty(true);
        return newItems;
      });
    }
  };

  const saveOrder = async () => {
    try {
      setIsSubmitting(true);

      // Prepare the data for the reorder endpoint
      const orderData = linkData.map((link, index) => ({
        id: link.id,
        order: (index + 1) * 100,
      }));

      const response = await fetch("/api/links/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message);
      }

      // Update local state with new order values
      setLinkData(
        linkData.map((link, index) => ({
          ...link,
          order: (index + 1) * 100,
        })),
      );

      setIsDirty(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return isLoading ? (
    <div className="flex flex-col gap-2">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-50 to-gray-200 p-12 rounded-lg"
          />
        ))}
    </div>
  ) : (
    <>
      <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links</h1>
          <p className="text-muted-foreground">
            View and manage Link In Bio links.
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button
              onClick={saveOrder}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Saving..." : "Save Order"}
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-1" /> Create New Link
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {linkData.length === 0 ? (
        <div className="w-full p-8 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center gap-4">
          <p>No Links created yet.</p>
          <p className="text-sm text-gray-400">
            Create links to display in your Links page
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-1" /> Create New Link
          </Button>
        </div>
      ) : (
        <div className="link-container">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={linkData.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {linkData.map((link) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onToggleActive={handleToggleLinkActive}
                  onEdit={handleEditLink}
                  onDelete={handleDeleteLinkClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Create/Edit Link Dialog with Form Validation */}
      <AlertDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          // Only allow the dialog to close if we're not submitting
          // This prevents accidental closing during validation
          if (!isSubmitting) {
            setIsCreateDialogOpen(open);
            if (!open) {
              setIsEditMode(false);
              setSelectedLink(null);
              form.reset();
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditMode ? "Edit Link" : "Create New Link"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode
                ? "Edit the information for this link."
                : "Add the information for the new link you want to create."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                // Success handler - only called when validation passes
                async (values) => {
                  setIsSubmitting(true);
                  setError(null);

                  try {
                    let response;

                    if (isEditMode && selectedLink) {
                      // Edit existing link
                      response = await fetch(`/api/links/${selectedLink.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          id: selectedLink.id,
                          title: values.title,
                          description: values.description || null,
                          url: values.url,
                          image: values.image || null,
                          active: values.active,
                        }),
                      });

                      const { data, error: responseError } =
                        await response.json();

                      if (responseError) {
                        throw new Error(responseError.message);
                      }

                      // Update local state
                      setLinkData(
                        linkData.map((link) =>
                          link.id === selectedLink.id ? (data as Link) : link,
                        ),
                      );
                    } else {
                      // Create new link
                      const highestOrder =
                        linkData.length > 0
                          ? Math.max(
                              ...linkData.map((link) => link.order ?? 0),
                            ) + 100
                          : 100;

                      response = await fetch("/api/links", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          title: values.title,
                          description: values.description || null,
                          url: values.url,
                          active: values.active,
                          order: highestOrder,
                          image:
                            values.image ||
                            "https://api.unicornlanding.com/storage/v1/object/public/brand-assets//link-icon.svg",
                        }),
                      });

                      const { data, error: responseError } =
                        await response.json();

                      if (responseError) {
                        throw new Error(responseError.message);
                      }

                      // Update local state
                      setLinkData((prev) => [...prev, data as Link]);
                    }

                    // Only close on success
                    setIsCreateDialogOpen(false);
                    setSelectedLink(null);
                    setIsEditMode(false);
                    form.reset();
                  } catch (err: any) {
                    console.error(err);
                    setError(err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                },
                // Error handler - called when validation fails
                (errors) => {
                  console.error("Validation errors:", errors);
                  // Don't close the dialog, just show the validation errors
                  setIsSubmitting(false);
                },
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Link Title" {...field} />
                    </FormControl>
                    <FormDescription>The title of your link</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Link Description" {...field} />
                    </FormControl>
                    <FormDescription>
                      A short description for the link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <ExternalLink className="w-5 h-5 mr-2 text-muted-foreground" />
                        <Input placeholder="https://example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The URL this link points to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      An image to display with this link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        This link will be visible to users
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel
                  type="button"
                  onClick={() => {
                    // Make sure we can only cancel if not submitting
                    if (!isSubmitting) {
                      setIsCreateDialogOpen(false);
                      setIsEditMode(false);
                      setSelectedLink(null);
                      form.reset();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={
                    isEditMode
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  }
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                      ? "Save Changes"
                      : "Create Link"}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
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
