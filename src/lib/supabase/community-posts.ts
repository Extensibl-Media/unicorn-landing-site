// src/lib/supabase/podcasts.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { AstroCookies } from "astro";
import type { Database } from "@/types/supabase";

export type CommunityPost =
  Database["public"]["Tables"]["community_posts"]["Row"];

export async function getPosts(
  request: Request,
  cookies: AstroCookies,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<{ posts: CommunityPost[]; count: number; totalPages: number }> {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });
  const { page = 1, limit = 10 } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("community_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: posts, error, count } = await query;

  if (error) throw error;

  return {
    posts: posts || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getPostById(
  request: Request,
  cookies: AstroCookies,
  id: number
): Promise<CommunityPost> {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: post, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return post;
}

// Function to get podcasts for admin dashboard
export async function getAdminPosts(
  request: Request,
  cookies: AstroCookies,
  options?: Record<string, any>
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });
  const {
    page = 1,
    limit = 50,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = options ?? {};

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("community_posts").select("*", { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data: posts, error, count } = await query;

  if (error) throw error;
  return {
    posts: posts || [],
    count: count || 0,
    pagination: {
      current: page,
      pages: Math.ceil((count || 0) / limit),
      hasMore: page * limit < (count || 0),
      total: count || 0,
    },
  };
}

export async function createPost(
  request: Request,
  cookies: AstroCookies,
  data: Omit<CommunityPost, "id" | "created_at" | "updated_at">
): Promise<CommunityPost> {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: newPost, error } = await supabase
    .from("community_posts")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return newPost;
}

export async function createPostClient(
  post: Omit<CommunityPost, "id" | "created_at" | "updated_at">
): Promise<CommunityPost> {
  const supabase = createBrowserClient();

  const { data: newPost, error } = await supabase
    .from("community_posts")
    .insert(post)
    .select()
    .single();

  if (error) throw error;

  return newPost;
}

export async function updatePostClient(
  postId: number,
  updates: Partial<CommunityPost>
): Promise<CommunityPost> {
  const supabase = createBrowserClient();

  const { data: udpatedPost, error } = await supabase
    .from("community_posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;

  return udpatedPost;
}

export async function updatePost(
  request: Request,
  cookies: AstroCookies,
  postId: number,
  updates: Partial<CommunityPost>
): Promise<CommunityPost> {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { data: updatedPost, error } = await supabase
    .from("community_posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;

  return updatedPost;
}

// Function to delete a post
export async function deletePost(
  request: Request,
  cookies: AstroCookies,
  postId: number
) {
  const supabase = createClient({
    headers: request.headers,
    cookies: cookies,
  });

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;

  return true;
}
