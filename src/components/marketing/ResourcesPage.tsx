// ResourcesPage.jsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { Post, Tag } from "@/lib/supabase/blog";
import type { Podcast } from "@/lib/supabase/podcasts";
import type { Database } from "@/types/supabase";

type ArticleResource = Post & {
  category: "articles";
  tags?: Tag[];
  excerpt?: string;
  featured_image?: string;
  slug: string;
};

type PodcastResource = Podcast & {
  category: "podcasts";
  description?: string;
};

type CommunityResource =
  Database["public"]["Tables"]["community_posts"]["Row"] & {
    category: "community";
  };

type Resource = ArticleResource | PodcastResource | CommunityResource;

const CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "articles", label: "Articles" },
  { id: "community", label: "Community" },
  { id: "podcasts", label: "Podcasts" },
];

export default function ResourcesPage({
  articles,
  podcasts,
}: {
  articles: Post[];
  podcasts: Podcast[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const resources: Resource[] = [
    ...articles.map(
      (article: Post) =>
        ({ ...article, category: "articles" } as ArticleResource)
    ),
    ...podcasts.map(
      (podcast: Podcast) =>
        ({ ...podcast, category: "podcasts" } as PodcastResource)
    ),
  ];

  const filteredResources = resources.filter((resource: Resource) => {
    // Filter by category
    if (activeCategory !== "all" && resource.category !== activeCategory) {
      return false;
    }

    // Type narrowing in each case
    switch (resource.category) {
      case "articles":
        // TypeScript knows resource is ArticleResource here
        return (
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags?.some((tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      case "podcasts":
        // TypeScript knows resource is PodcastResource here
        return (
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      default:
        // This should be unreachable with a proper discriminated union
        return false;
    }
  });

  const renderResourceCard = (resource: Resource) => {
    switch (resource.category) {
      case "articles": {
        // TypeScript knows resource is ArticleResource here
        return (
          <a
            href={`/resources/articles/${resource.slug}`}
            key={resource.id}
            className="group"
          >
            <Card className="overflow-hidden border border-pink-100 hover:border-pink-300 transition-all rounded-xl shadow-sm hover:shadow-md">
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={resource.featured_image}
                  alt={resource.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2 bg-pink-500 text-white hover:bg-pink-600">
                  Article
                </Badge>
              </div>
              <CardHeader className="pb-2">
                {resource.created_at && (
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {format(new Date(resource.created_at), "PPP")}
                    </div>
                  </div>
                )}
                <CardTitle className="text-lg font-bold text-gray-800">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  By Unicorn Landing
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600">{resource.excerpt}</p>
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-1">
                {resource.tags?.map((tag: Tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </a>
        );
      }
      case "community": {
        // Community resources are not implemented yet, returning null
        return (
          <a
            href={`/resources/community/${resource.id}`}
            key={resource.id}
            className="group"
          >
            <Card className="overflow-hidden border border-pink-100 hover:border-pink-300 transition-all rounded-xl shadow-sm hover:shadow-md">
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={resource.cover_image}
                  alt={resource.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2 bg-pink-500 text-white hover:bg-pink-600">
                  Community
                </Badge>
              </div>
              <CardHeader className="pb-2">
                {resource.created_at && (
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {format(new Date(resource.created_at), "PPP")}
                    </div>
                  </div>
                )}
                <CardTitle className="text-lg font-bold text-gray-800">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  By Unicorn Landing
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600">{resource.description}</p>
              </CardContent>
            </Card>
          </a>
        );
      }
      case "podcasts": {
        // TypeScript knows resource is PodcastResource here
        return (
          <a
            href={resource.external_url || `#podcast-${resource.id}`}
            key={resource.id}
            className="group"
          >
            <Card className="overflow-hidden border border-purple-100 hover:border-purple-300 transition-all rounded-xl shadow-sm hover:shadow-md">
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={resource.image_url || "/podcast-placeholder.jpg"}
                  alt={resource.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2 bg-purple-500 text-white hover:bg-purple-600">
                  Podcast
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {resource.release_date
                      ? format(new Date(resource.release_date), "PPP")
                      : "No release date"}
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {resource.channel_name || "Unicorn Landing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600">
                  {resource.description || resource.subtitle}
                </p>
              </CardContent>
            </Card>
          </a>
        );
      }
      default: {
        // Exhaustiveness check - this should never happen with a proper discriminated union
        const _exhaustiveCheck: never = resource;
        return null;
      }
    }
  };

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Resources
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Explore our collection of articles, podcasts, videos, and guides
        </p>

        <div className="max-w-md mx-auto">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full border-pink-200 focus:border-pink-500 focus-visible:ring-pink-500 pl-4"
          />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-8"
      >
        <TabsList className="mx-auto bg-white rounded-full p-1 flex justify-center flex-wrap h-fit">
          {CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="rounded-full px-4 py-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-700 hover:text-pink-700 focus-visible:ring-pink-500"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => renderResourceCard(resource))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            No resources found. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
