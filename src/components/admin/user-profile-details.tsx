import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  User,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Star,
  Heart,
  Image,
  Trash,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

import type { ContentModerationUpload } from "@/components/admin/content-uploads-table";
import { UserProfileEditForm } from "./user-profile-edit-form";

type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  profile_type: "COUPLE" | "UNICORN" | null;
  looking_for: "COUPLE" | "UNICORN" | null;
  birthday: string | null;
  age: number | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  location: string | null;
  personality_style: string[] | null;
  bio: string | null;
  ideal_match: string | null;
  interested_in: string[] | null;
  verified: boolean | null;
  featured_user: boolean | null;
  featured_expiry: string | null;
  premium_user: boolean | null;
  approved: boolean | null;
  latitude: number | null;
  longitude: number | null;
  hide_from_search: boolean | null;
  created_at: string | null;
  user_uploads: string[] | null;
};

interface UserProfileDetailsProps {
  profile: Profile;
  uploads: ContentModerationUpload[];
}

const SUCCESS_MAP = {
  APPROVED: "Image approved successfully",
  REJECTED: "Image rejected successfully",
  DELETED: "Image deleted successfully",
};

export function UserProfileDetails({
  profile,
  uploads,
}: UserProfileDetailsProps) {
  const [activeProfile, setActiveProfile] = useState<Profile>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadedMedia, setUploadedMedia] =
    useState<ContentModerationUpload[]>(uploads);

  useEffect(() => {
    setUploadedMedia(uploads);
  }, [uploads]);

  const handleApprovalChange = async (status: boolean) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/${activeProfile.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update approval status");
      }

      setActiveProfile({
        ...activeProfile,
        approved: status,
      });

      setSuccessMessage(
        `User ${status ? "approved" : "unapproved"} successfully`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlockUser = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/${activeProfile.id}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to block user");
      }

      setSuccessMessage("User has been blocked and data deleted");
      window.location.href = "/admin/users";
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleModerateImage = async (
    status: string,
    uploadId: number,
    imageType: string,
    url: string,
    userId: string | null
  ) => {
    if (!userId) {
      setErrorMessage("User ID is required");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const upload = uploadedMedia.find((u) => u.id === uploadId);

    try {
      if (!upload) {
        throw new Error("Upload not found");
      }
      const response = await fetch(`/api/content-moderation/${uploadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, imageType, url, userId }),
      });

      if (!response.ok) throw new Error("Something went wrong");
      const responseData = await response.json();

      setSuccessMessage(SUCCESS_MAP[status as keyof typeof SUCCESS_MAP]);
      setActiveProfile(responseData.data.profile);
      setUploadedMedia(responseData.data.uploads);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideFromSearchChange = async (hidden: boolean) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/users/${activeProfile.id}/hide-from-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hidefromSearch: hidden }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update approval status");
      }

      setActiveProfile({
        ...activeProfile,
        hide_from_search: hidden,
      });

      setSuccessMessage(`User ${hidden ? "hidden" : "shown"} successfully`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleVerificationChange = async (verified: boolean) => {
    let response: Response;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (verified) {
        response = await fetch(`/api/users/${activeProfile.id}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verified: true,
            verification_status: "APPROVED",
          }),
        });
      } else {
        response = await fetch(`/api/users/${activeProfile.id}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verified: false,
            verification_status: "DENIED",
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process user verification");
      }

      setActiveProfile({
        ...activeProfile,
        verified: verified,
      });
      setSuccessMessage(
        `User verification ${verified ? "approved" : "denied"} successfully.`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="details">
        <TabsList className="flex flex-col md:flex-row h-fit justify-start items-start mt-4">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="uploads">
            Uploads ({profile.user_uploads?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* Status messages */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mt-4">
            {successMessage}
          </div>
        )}

        {/* Profile Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Summary Card */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle>User Profile</CardTitle>
                  <UserProfileEditForm
                    profile={profile}
                    onProfileUpdate={setActiveProfile}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={activeProfile.avatar_url || ""} />
                    <AvatarFallback>
                      {activeProfile.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h3 className="font-medium text-lg">
                      {activeProfile.username}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {activeProfile.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge
                      variant={activeProfile.approved ? "default" : "outline"}
                    >
                      {activeProfile.approved ? "Approved" : "Pending Approval"}
                    </Badge>

                    {activeProfile.profile_type && (
                      <Badge variant="outline">
                        {activeProfile.profile_type}
                      </Badge>
                    )}

                    {activeProfile.premium_user && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                    {activeProfile.verified && (
                      <Badge variant="outline" className="border-pink-400">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex gap-2 items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Age:
                      </span>
                      <div>{activeProfile.age || "Unknown"}</div>
                    </div>
                  </div>

                  {activeProfile.location && (
                    <div className="flex gap-2 items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Location:
                        </span>
                        <div>{activeProfile.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pb-6 pt-2">
                <div className="flex flex-col items-center gap-4 w-full">
                  <Button
                    className={`w-full ${
                      !activeProfile.approved && "bg-green-500"
                    }`}
                    variant={activeProfile.approved ? "outline" : "default"}
                    onClick={() =>
                      handleApprovalChange(!activeProfile.approved)
                    }
                    disabled={isSubmitting}
                  >
                    {activeProfile.approved ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleBlockUser()}
                    // disabled={}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Block User
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* User Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Bio
                  </h3>
                  <p className="whitespace-pre-line">
                    {activeProfile.bio || "No bio provided"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-muted-foreground mb-2">
                      Looking For
                    </h3>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>
                        {activeProfile.looking_for || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-muted-foreground mb-2">
                      Age Preferences
                    </h3>
                    <div>
                      {activeProfile.preferred_age_min &&
                      activeProfile.preferred_age_max
                        ? `${activeProfile.preferred_age_min} - ${activeProfile.preferred_age_max} years`
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Ideal Match
                  </h3>
                  <p className="whitespace-pre-line">
                    {activeProfile.ideal_match || "Not specified"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Interested In
                  </h3>
                  <p className="whitespace-pre-line">
                    {activeProfile.interested_in?.map((interest) => (
                      <span>- {interest}</span>
                    )) || "Not specified"}
                  </p>
                </div>

                {activeProfile.personality_style &&
                  activeProfile.personality_style.length > 0 && (
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        Personality Styles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeProfile.personality_style.map((style, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="bg-pink-500"
                          >
                            {style.split("_").join(" ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Uploads Tab */}
        <TabsContent value="uploads" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Uploads</CardTitle>
              <CardDescription>Manage user uploaded content</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.user_uploads?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No uploads found
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.user_uploads?.map((upload, index) => (
                    <div
                      key={`${upload}-${Math.floor(Math.random() * 1000)}`}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-md overflow-hidden bg-muted">
                        <img
                          src={upload}
                          alt={`User upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-400"
                            onClick={() => {
                              const uploadData = uploadedMedia.find(
                                (media) => media.url_string === upload
                              );
                              if (uploadData) {
                                handleModerateImage(
                                  "APPROVED",
                                  uploadData.id,
                                  uploadData.image_type,
                                  uploadData.url_string,
                                  activeProfile.id
                                );
                              } else {
                                setErrorMessage("Upload not found");
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const uploadData = uploadedMedia.find(
                                (media) => media.url_string === upload
                              );
                              if (uploadData) {
                                handleModerateImage(
                                  "REJECTED",
                                  uploadData.id,
                                  uploadData.image_type,
                                  uploadData.url_string,
                                  activeProfile.id
                                );
                              } else {
                                setErrorMessage("Upload not found");
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              console.log(upload);
                              const uploadData = uploadedMedia.find(
                                (media) => media.url_string === upload
                              );
                              if (uploadData) {
                                handleModerateImage(
                                  "DELETED",
                                  uploadData.id,
                                  uploadData.image_type,
                                  uploadData.url_string,
                                  activeProfile.id
                                );
                              } else {
                                setErrorMessage("Upload not found");
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={upload ? "default" : "destructive"}
                          className="opacity-80"
                        >
                          {
                            uploadedMedia.find(
                              (media) => media.url_string === upload
                            )?.status
                          }
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Controls</CardTitle>
              <CardDescription>
                Manage user status and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="approved">Account Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow user on the platform
                      </p>
                    </div>
                    <Switch
                      id="approved"
                      checked={!!activeProfile.approved}
                      onCheckedChange={(checked) =>
                        handleApprovalChange(checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="verified">Verified Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark user as verified
                      </p>
                    </div>
                    <Switch
                      id="verified"
                      checked={!!activeProfile.verified}
                      onCheckedChange={(checked) =>
                        handleVerificationChange(checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hide-search">Hide From Search</Label>
                      <p className="text-sm text-muted-foreground">
                        Remove from search results
                      </p>
                    </div>
                    <Switch
                      id="hide-search"
                      checked={!!activeProfile.hide_from_search}
                      onCheckedChange={(checked) =>
                        handleHideFromSearchChange(checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Dialogs */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to block this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
