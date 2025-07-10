import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/browser";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  title: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  imageUrl: z.string().optional(),
  url: z.string().optional(),
  details: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export function SubmitEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      imageUrl: "",
      url: "",
      details: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const html = `
        <h2>New Event Form Submission</h2>
        <p><strong>Name:</strong> ${values.name}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>Event Name:</strong> ${values.title}</p>
        ${values.url ? `<p><strong>URL:</strong> ${values.url}</p>` : ""}
        ${
          values.imageUrl
            ? `<p><strong>Image URL:</strong> ${values.imageUrl}</p>`
            : ""
        }
        <br />
        <p><strong>Details:</strong></p>
        <p>${values.details}</p>
        <br />
        <p>This message was sent from the Unicorn Landing website.</p>
        `;
      const { error } = await supabase.functions.invoke(
        "send-email-to-platform",
        {
          body: {
            subject: `New event submission from ${values.name}`,
            from: values.email,
            html,
          },
        }
      );
      if (error) throw error;

      // Show success toast
      toast("Event submitted, we will get back to you as soon as possible!");

      // Reset form
      form.reset();
    } catch (error) {
      // Show error toast
      toast("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What is the name of your event?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Link to a website with any additional details"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Share a link to any promo image"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us how we can help..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please provide as much detail as possible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-400 text-white rounded-full transition-colors duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Submit My Event"
            )}
          </Button>
        </form>
      </Form>
      <Toaster />
    </>
  );
}
