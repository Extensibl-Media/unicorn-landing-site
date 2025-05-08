import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, Search, Clock } from "lucide-react";
import { format } from "date-fns";

interface PodcastsFiltersProps {
  search: string;
  channel: string;
  sortBy: string;
  sortOrder: string;
  dateFrom?: string;
  dateTo?: string;
}

export function PodcastsFilters({
  search,
  channel,
  sortBy,
  sortOrder,
  dateFrom,
  dateTo,
}: PodcastsFiltersProps) {
  // Update URL with new search params
  const updateFilters = (updates: Partial<PodcastsFiltersProps>) => {
    const params = new URLSearchParams(window.location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  // Format duration for display (from seconds to MM:SS)
  const formatDuration = (seconds: string | undefined) => {
    if (!seconds) return "";
    const secs = parseInt(seconds);
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Convert duration from MM:SS to seconds
  const parseDuration = (duration: string): string | undefined => {
    if (!duration) return undefined;

    const parts = duration.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return String(minutes * 60 + seconds);
      }
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search podcasts..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-8"
          />
        </div>
        <Select
          value={channel}
          onValueChange={(value) => updateFilters({ channel: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="tech-talks">Tech Talks</SelectItem>
            <SelectItem value="business-insights">Business Insights</SelectItem>
            <SelectItem value="design-digest">Design Digest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateFrom ? format(new Date(dateFrom), "PP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom ? new Date(dateFrom) : undefined}
                onSelect={(date) =>
                  updateFilters({ dateFrom: date?.toISOString() })
                }
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateTo ? format(new Date(dateTo), "PP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo ? new Date(dateTo) : undefined}
                onSelect={(date) =>
                  updateFilters({ dateTo: date?.toISOString() })
                }
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="release_date">Release Date</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="channel_name">Channel</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) => updateFilters({ sortOrder: value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
