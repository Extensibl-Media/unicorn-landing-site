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

const CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "articles", label: "Articles" },
  { id: "podcasts", label: "Podcast Episodes" },
];

// Sample data - replace with your actual data fetching
const RESOURCES = [
  {
    id: 1,
    title: "Getting Started with Astro",
    description:
      "Learn the basics of Astro and how to set up your first project.",
    date: "April 15, 2025",
    category: "articles",
    tags: ["astro", "beginner"],
    image: "/api/placeholder/400/250",
    author: "Jane Smith",
  },
  {
    id: 2,
    title: "Tailwind Tips & Tricks",
    description:
      "Advanced techniques for styling your Astro site with Tailwind.",
    date: "April 10, 2025",
    category: "articles",
    tags: ["tailwind", "css", "styling"],
    image: "/api/placeholder/400/250",
    author: "Mark Johnson",
  },
  {
    id: 3,
    title: "EP 42: The Future of Web Development",
    description:
      "A discussion about upcoming trends in web development for 2025.",
    date: "April 8, 2025",
    category: "podcasts",
    tags: ["podcast", "trends"],
    duration: "45 min",
    image: "/api/placeholder/400/250",
    author: "Tech Talk Podcast",
  },
  {
    id: 4,
    title: "Building Accessible UI Components",
    description: "Learn how to create inclusive interfaces for all users.",
    date: "April 5, 2025",
    category: "podcasts",
    tags: ["accessibility", "ui", "react"],
    duration: "32 min",
    image: "/api/placeholder/400/250",
    author: "WebDev Channel",
  },
  {
    id: 5,
    title: "Complete Guide to Astro Islands",
    description:
      "Understand how Astro islands work and when to use them effectively.",
    date: "March 28, 2025",
    category: "articles",
    tags: ["astro", "advanced", "performance"],
    image: "/api/placeholder/400/250",
    author: "Alex Rivera",
  },
  {
    id: 6,
    title: "EP 43: Integrating React in Astro",
    description:
      "How to use React components effectively within your Astro project.",
    date: "March 25, 2025",
    category: "podcasts",
    tags: ["podcast", "react", "astro"],
    duration: "38 min",
    image: "/api/placeholder/400/250",
    author: "Tech Talk Podcast",
  },
];

export default function ResourcesPage({ articles }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const resources = [
    ...articles.map((article) => ({ ...article, category: "articles" })),
  ];

  const filteredResources = resources.filter((resource) => {
    // Filter by category
    if (activeCategory !== "all" && resource.category !== activeCategory) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.title?.toLowerCase().includes(query) ||
        resource.excerpt?.toLowerCase().includes(query) ||
        resource.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Function to render the appropriate resource card based on category
  const renderResourceCard = (resource) => {
    const articleCard = (
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
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {format(new Date(resource.created_at), "PPP")}
            </div>
          </div>
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
          {resource.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
            >
              {tag.name}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    );

    // You could customize the card based on resource type
    switch (resource.category) {
      case "articles":
        return (
          <a
            href={`/resources/articles/${resource.slug}`}
            key={resource.id}
            className="group"
          >
            {articleCard}
          </a>
        );
      case "podcasts":
        return (
          <div key={resource.id} className="group">
            {/* {commonCard} */}
          </div>
        );
      // case "videos":
      //   return (
      //     <div key={resource.id} className="group">
      //       {commonCard}
      //     </div>
      //   );
      default:
        return null;
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
