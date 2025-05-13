import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Link, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePodcastClient } from "@/lib/supabase/podcasts";
import type { Podcast } from "@/lib/supabase/podcasts";
import { PUBLIC_SITE_URL } from "astro:env/client";

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  channel_name: z.string().min(1, "Channel is required"),
  external_url: z.string().url("Must be a valid URL"),
  image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  release_date: z.date().optional().nullable(),
  duration: z.number().positive("Duration must be a positive number"),
});

interface EditPodcastFormProps {
  podcast: Podcast;
  channels: { name: string; value: string }[];
}

export function EditPodcastForm({ podcast, channels }: EditPodcastFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing podcast data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: podcast.title,
      subtitle: podcast.subtitle,
      channel_name: podcast.channel_name,
      external_url: podcast.external_url,
      image_url: podcast.image_url,
      release_date: podcast.release_date
        ? new Date(podcast.release_date)
        : undefined,
      duration: podcast.duration,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/admin/podcasts/${podcast.id}/edit`, {
        method: "PATCH",
        body: JSON.stringify({
          id: podcast.id,
          title: values.title,
          subtitle: values.subtitle,
          channel_name: values.channel_name,
          duration: values.duration,
          external_url: values.external_url,
          image_url: values.image_url,
          release_date: values.release_date
            ? values.release_date.toISOString()
            : null,
        }),
      });
      if (!response.ok) {
        console.error("Failed to edit podcast");
        return;
      }

      // Redirect to the podcast details page
      window.location.href = `/admin/podcasts/${podcast.id}`;
    } catch (error) {
      console.error("Error updating podcast:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Podcast Title" {...field} />
                </FormControl>
                <FormDescription>
                  The title of your podcast episode
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Channel */}
          <FormField
            control={form.control}
            name="channel_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The channel/show this episode belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subtitle */}
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the episode"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A short description or subtitle for the episode
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* External URL */}
          <FormField
            control={form.control}
            name="external_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External URL</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Link className="w-5 h-5 mr-2 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/podcast"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Link to where the podcast can be played
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image URL */}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Cover art image URL (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                    <Input placeholder="mm:ss (e.g. 32:45)" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  Length of the podcast in minutes:seconds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Release Date */}
          <FormField
            control={form.control}
            name="release_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Release Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When the podcast was or will be published
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
            onClick={() =>
              (window.location.href = `/admin/podcasts/${podcast.id}`)
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
