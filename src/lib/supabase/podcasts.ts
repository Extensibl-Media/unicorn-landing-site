// src/lib/supabase/podcasts.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { AstroCookies } from "astro";

export interface Podcast {
  id: number;
  title: string;
  subtitle: string | null;
  channel_name: string;
  created_at: string;
  duration: number;
  external_url: string;
  image_url: string | null;
  release_date: string | null;
}

interface AdminPodcastsOptions {
  page?: number;
  limit?: number;
  search?: string;
  channel?: string | "all";
  sortBy?:
    | "release_date"
    | "created_at"
    | "title"
    | "channel_name"
    | "duration";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  minDuration?: string;
  maxDuration?: string;
}

// Function to get podcasts for public site
export async function getPodcasts(
  request: Request,
  cookies: AstroCookies,
  options?: {
    page?: number;
    limit?: number;
    channel?: string;
  },
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });
  const { page = 1, limit = 10, channel } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("podcast_links")
    .select("*", { count: "exact" })
    .order("release_date", { ascending: false })
    .range(from, to);

  if (channel) {
    query = query.eq("channel_name", channel);
  }

  const { data: podcasts, error, count } = await query;

  if (error) throw error;

  return {
    podcasts: podcasts || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// Function to get a single podcast by id
export async function getPodcastById(
  request: Request,
  cookies: AstroCookies,
  id: number,
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: podcast, error } = await supabase
    .from("podcast_links")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return podcast;
}

// Function to get podcasts for admin dashboard
export async function getAdminPodcasts(
  request: Request,
  cookies: AstroCookies,
  options?: AdminPodcastsOptions,
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });
  const {
    page = 1,
    limit = 50,
    search = "",
    channel = "all",
    sortBy = "release_date",
    sortOrder = "desc",
    dateFrom,
    dateTo,
    minDuration,
    maxDuration,
  } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("podcast_links").select("*", { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%, subtitle.ilike.%${search}%`);
  }

  if (channel !== "all") {
    query = query.eq("channel_name", channel);
  }

  if (dateFrom) {
    query = query.gte("release_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("release_date", dateTo);
  }

  if (minDuration) {
    query = query.gte("duration", minDuration);
  }

  if (maxDuration) {
    query = query.lte("duration", maxDuration);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data: podcasts, error, count } = await query;

  if (error) throw error;

  // Get stats about the podcasts
  const totalDuration =
    podcasts?.reduce((total, podcast) => total + podcast.duration, 0) || 0;
  const totalMinutes = Math.floor(totalDuration / 60);

  // Count unique channels
  const channelSet = new Set(podcasts?.map((podcast) => podcast.channel_name));
  console.log({ podcasts, error });

  return {
    podcasts: podcasts || [],
    count: count || 0,
    pagination: {
      current: page,
      pages: Math.ceil((count || 0) / limit),
      hasMore: page * limit < (count || 0),
      total: count || 0,
    },
    stats: {
      total: count || 0,
      channels: channelSet.size,
      totalDuration: totalMinutes,
    },
  };
}

export async function createPodcast(
  request: Request,
  cookies: AstroCookies,
  podcast: {
    title: string;
    subtitle?: string;
    channel_name: string;
    duration: number;
    external_url: string;
    image_url?: string;
    release_date?: string;
  },
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: newPodcast, error } = await supabase
    .from("podcast_links")
    .insert({
      title: podcast.title,
      subtitle: podcast.subtitle,
      channel_name: podcast.channel_name,
      duration: podcast.duration,
      external_url: podcast.external_url,
      image_url: podcast.image_url,
      release_date: podcast.release_date,
    })
    .select()
    .single();

  if (error) throw error;

  return newPodcast;
}

export async function createPodcastClient(podcast: {
  title: string;
  subtitle?: string;
  channel_name: string;
  duration: number;
  external_url: string;
  image_url?: string;
  release_date?: string;
}) {
  const supabase = createBrowserClient();

  const { data: newPodcast, error } = await supabase
    .from("podcast_links")
    .insert({
      title: podcast.title,
      subtitle: podcast.subtitle,
      channel_name: podcast.channel_name,
      duration: podcast.duration,
      external_url: podcast.external_url,
      image_url: podcast.image_url,
      release_date: podcast.release_date,
    })
    .select()
    .single();

  if (error) throw error;

  return newPodcast;
}

export async function updatePodcastClient(
  podcastId: number,
  updates: Partial<Podcast>,
) {
  const supabase = createBrowserClient();

  const { data: updatedPodcast, error } = await supabase
    .from("podcast_links")
    .update(updates)
    .eq("id", podcastId)
    .select()
    .single();

  if (error) throw error;

  return updatedPodcast;
}

export async function updatePodcast(
  request: Request,
  cookies: AstroCookies,
  podcastId: number,
  updates: Partial<Podcast>,
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: updatedPodcast, error } = await supabase
    .from("podcast_links")
    .update(updates)
    .eq("id", podcastId)
    .select()
    .single();

  if (error) throw error;

  return updatedPodcast;
}

// Function to delete a podcast
export async function deletePodcast(
  request: Request,
  cookies: AstroCookies,
  podcastId: number,
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { error } = await supabase
    .from("podcast_links")
    .delete()
    .eq("id", podcastId);

  if (error) throw error;

  return true;
}

// Function to get all unique channel names
export async function getChannels(request: Request, cookies: AstroCookies) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from("podcast_links")
    .select("channel_name")
    .order("channel_name");

  if (error) throw error;

  // Extract unique channel names
  const uniqueChannels = [...new Set(data?.map((item) => item.channel_name))];

  return (
    uniqueChannels.map((name) => ({
      name,
      value: name,
    })) || []
  );
}
