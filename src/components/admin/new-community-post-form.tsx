import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Define the form schema for community posts
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  associated_link: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Associated link is required"),
  body: z.string().min(1, "Body content is required"),
  cover_image: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Cover image URL is required"),
});

export function NewCommunityPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      associated_link: "",
      body: "",
      cover_image: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/admin/community-posts/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          associated_link: values.associated_link,
          body: values.body,
          cover_image: values.cover_image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create community post");
      }

      // Redirect will be handled by the server
      window.location.href = "/admin/community-posts";
    } catch (error) {
      console.error("Error creating community post:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Community Post Title" {...field} />
                </FormControl>
                <FormDescription>
                  The title of your community post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Associated Link */}
          <FormField
            control={form.control}
            name="associated_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/resource"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A link associated with the community post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a brief description of your community post"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A short description of your community post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Body */}
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write the content of your community post here"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The main content of your community post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <FormField
            control={form.control}
            name="cover_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cover image URL for the community post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = "/admin/community_posts")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Community Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
