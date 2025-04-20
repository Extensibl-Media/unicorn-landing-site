import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Star,
  Calendar,
  User,
  MessageSquare,
  Edit2,
  Save,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/supabase";
import { DeleteClubModal } from "./delete-club-modal";
import { formatDistanceToNow } from "date-fns";

type Club = Database["public"]["Tables"]["clubs"]["Row"];
type Review = Database["public"]["Tables"]["club_reviews"]["Row"] & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

interface ClubDetailsProps {
  club: Club;
  reviews: Review[];
}

export function ClubDetails({ club, reviews }: ClubDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedClub, setEditedClub] = useState<Club>(club);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedClub((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedClub((prev) => ({
      ...prev,
      [name]: value === "" ? null : parseFloat(value),
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await fetch(`/api/clubs/${club.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedClub.name,
          description: editedClub.description,
          address: editedClub.address,
          city: editedClub.city,
          state: editedClub.state,
          latitude: editedClub.latitude,
          longitude: editedClub.longitude,
          website_url: editedClub.website_url,
          cover_image: editedClub.cover_image,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const err = await response.json();
          return await Promise.reject(err);
        }
        return response.json();
      });

      if (error) throw new Error(error.message);

      setSuccessMessage("Club details updated successfully");
      setIsEditing(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred while saving",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuccess = () => {
    window.location.href = "/admin/clubs";
  };

  return (
    <>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}

          <div className="flex justify-between mb-4">
            <div></div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedClub(club);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Club
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Club Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Club Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedClub.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={editedClub.description || ""}
                        onChange={handleInputChange}
                        rows={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_image">Cover Image URL</Label>
                      <Input
                        id="cover_image"
                        name="cover_image"
                        value={editedClub.cover_image || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        name="website_url"
                        value={editedClub.website_url || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        Description
                      </h3>
                      <p>{editedClub.description}</p>
                    </div>

                    {editedClub.website_url && (
                      <div>
                        <h3 className="font-medium text-muted-foreground mb-2">
                          Website
                        </h3>
                        <a
                          href={editedClub.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {editedClub.website_url}
                        </a>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        Club Stats
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>
                          Rating: {editedClub.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span>
                          Total Reviews: {editedClub.total_reviews || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={editedClub.address || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={editedClub.city || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={editedClub.state || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lat">Latitude</Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            value={editedClub.latitude || ""}
                            onChange={handleNumberChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lon">Longitude</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            value={editedClub.longitude || ""}
                            onChange={handleNumberChange}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editedClub.address && (
                        <div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div>
                              <div>{editedClub.address}</div>
                              {(editedClub.city || editedClub.state) && (
                                <div>
                                  {[editedClub.city, editedClub.state]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {editedClub.latitude && editedClub.longitude && (
                        <div>
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              Coordinates
                            </span>
                            <div>
                              {editedClub.latitude.toFixed(6)},{" "}
                              {editedClub.longitude.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {editedClub.cover_image ? (
                    <img
                      src={editedClub.cover_image}
                      alt={editedClub.name}
                      className="rounded-md w-full aspect-video object-cover mb-2"
                    />
                  ) : (
                    <div className="bg-muted rounded-md w-full aspect-video flex items-center justify-center mb-2">
                      <span className="text-muted-foreground">
                        No cover image
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                The {reviews.length} most recent reviews for this club
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reviews yet
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {review.profiles?.username || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="mb-2">{review.review}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {review.created_at
                            ? formatDistanceToNow(new Date(review.created_at), {
                                addSuffix: true,
                              })
                            : "Unknown date"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteClubModal
        clubId={club.id}
        clubName={club.name}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
