import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  Images,
  Club,
  Theater,
  PartyPopper,
  Newspaper,
  MessageCircleQuestion,
  BadgeCheck,
  TriangleAlert,
  Link,
  Podcast,
  Users2,
  UserPen,
} from "lucide-react";
import { createClient } from "../../lib/supabase/browser";

export default function AdminSidebar() {
  const [isLoading, setIsLoading] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    {
      icon: TriangleAlert,
      label: "Reported Users",
      href: "/admin/reported-users",
    },
    {
      icon: BadgeCheck,
      label: "Verified Requests",
      href: "/admin/verification-requests",
    },
    { icon: Theater, label: "Clubs", href: "/admin/clubs" },
    { icon: PartyPopper, label: "Events", href: "/admin/events" },
    { icon: Newspaper, label: "Blog Posts", href: "/admin/blog" },
    { icon: Podcast, label: "Podcasts", href: "/admin/podcasts" },
    {
      icon: UserPen,
      label: "Communtity Posts",
      href: "/admin/community-posts",
    },
    { icon: Link, label: "Links Page", href: "/admin/links" },
    {
      icon: Images,
      label: "Content Moderation",
      href: "/admin/content-moderation",
    },
    // { icon: MessageCircleQuestion, label: "Support", href: "/admin/support" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const NavigationContent = () => (
    <>
      <nav className="flex-1 p-2 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-2 py-2 rounded-lg hover:bg-pink-200 transition-colors",
              window.location.pathname === item.href && "bg-pink-400 text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="ml-2">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-2">
        <form method="POST" action="/api/auth/signout">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-pink-200"
            type="submit"
            disabled={isLoading}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">{isLoading ? "Logging Out" : "Logout"}</span>
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <div className="">
      {/* Mobile View */}
      <Sheet>
        <div className="flex md:hidden h-16 items-center px-6 bg-white">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <h1 className="text-xl font-semibold ml-4">Admin Dashboard</h1>
        </div>
        <SheetContent side="left" className="w-64 p-0 overflow-y-scroll">
          <SheetHeader className="p-4 ">
            <SheetTitle className="">Admin</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col h-full w-64 bg-white">
        <div className="p-4 ">
          <span className="text-xl font-bold">Admin</span>
        </div>
        <NavigationContent />
      </div>
    </div>
  );
}
