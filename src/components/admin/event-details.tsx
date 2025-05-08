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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Info,
  Car,
  Edit2,
  Save,
  Trash2,
  Building,
  Star,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

type Event = {
  id: number;
  club_id: number | null;
  name: string;
  date: string;
  description: string;
  cover_image: string;
  address: string | null;
  city: string | null;
  state: string | null;

  parking_details: string | null;
  additional_info: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean | null;
  sponsored_event: boolean | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type Club = {
  id: number;
  name: string;
};

interface EventDetailsProps {
  event: Event;
  clubs: Club[];
}

export function EventDetails({ event, clubs }: EventDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event>(event);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    event.date ? parseISO(event.date) : undefined,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: value === "" ? null : parseFloat(value),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedEvent((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleBooleanChange = (name: string, checked: boolean) => {
    setEditedEvent((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Process the data to match database requirements
      const processedEvent = {
        ...editedEvent,
        date: date ? date.toISOString() : null,
        // Ensure required fields have values
        address: editedEvent.address || "",
        city: editedEvent.city || "",
        state: editedEvent.state || "",
        // Convert club_id to number if it's not null
        club_id:
          editedEvent.club_id?.toString() === "none"
            ? null
            : editedEvent.club_id
              ? typeof editedEvent.club_id === "string"
                ? parseInt(editedEvent.club_id, 10)
                : editedEvent.club_id
              : null,
      };

      const { error } = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedEvent),
      }).then(async (response) => {
        if (!response.ok) {
          const err = await response.json();
          return await Promise.reject(err);
        }
        return response.json();
      });

      if (error) throw new Error(error.message);

      setSuccessMessage("Event details updated successfully");
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
    window.location.href = "/admin/events";
  };

  const formatTimeRange = () => {
    if (editedEvent.all_day) {
      return "All Day";
    }

    let timeStr = "";
    if (editedEvent.start_time) {
      timeStr += editedEvent.start_time;
    }
    if (editedEvent.end_time) {
      timeStr += ` - ${editedEvent.end_time}`;
    }
    return timeStr || "Time not specified";
  };

  const getAssociatedClubName = () => {
    if (!editedEvent.club_id) return null;
    const club = clubs.find((c) => c.id === editedEvent.club_id);
    return club ? club.name : null;
  };

  return (
    <>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
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
                    setEditedEvent(event);
                    setDate(event.date ? parseISO(event.date) : undefined);
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
                  Delete Event
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
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedEvent.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="club_id">
                        Associated Club (Optional)
                      </Label>
                      <Select
                        value={editedEvent.club_id?.toString() || ""}
                        onValueChange={(value) =>
                          handleSelectChange("club_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a club (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Standalone Event)
                          </SelectItem>
                          {clubs.map((club) => (
                            <SelectItem
                              key={club.id}
                              value={club.id.toString()}
                            >
                              {club.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Event Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all_day"
                        checked={!!editedEvent.all_day}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("all_day", checked === true)
                        }
                      />
                      <Label htmlFor="all_day" className="cursor-pointer">
                        All-day event
                      </Label>
                    </div>

                    {!editedEvent.all_day && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_time">Start Time</Label>
                          <Input
                            id="start_time"
                            name="start_time"
                            type="time"
                            value={editedEvent.start_time || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_time">End Time</Label>
                          <Input
                            id="end_time"
                            name="end_time"
                            type="time"
                            value={editedEvent.end_time || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={editedEvent.description}
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
                        value={editedEvent.cover_image}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional_info">
                        Additional Information
                      </Label>
                      <Textarea
                        id="additional_info"
                        name="additional_info"
                        value={editedEvent.additional_info || ""}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sponsored_event"
                        checked={!!editedEvent.sponsored_event}
                        onCheckedChange={(checked) =>
                          handleBooleanChange(
                            "sponsored_event",
                            checked === true,
                          )
                        }
                      />
                      <Label
                        htmlFor="sponsored_event"
                        className="cursor-pointer"
                      >
                        Sponsored Event
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {editedEvent.club_id && getAssociatedClubName() && (
                      <div>
                        <h3 className="font-medium text-muted-foreground mb-2">
                          Associated Club
                        </h3>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{getAssociatedClubName()}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        Date & Time
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {editedEvent.date
                            ? format(parseISO(editedEvent.date), "PPP")
                            : "Date not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeRange()}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-muted-foreground mb-2">
                        Description
                      </h3>
                      <p className="whitespace-pre-line">
                        {editedEvent.description}
                      </p>
                    </div>

                    {editedEvent.additional_info && (
                      <div>
                        <h3 className="font-medium text-muted-foreground mb-2">
                          Additional Information
                        </h3>
                        <p className="whitespace-pre-line">
                          {editedEvent.additional_info}
                        </p>
                      </div>
                    )}

                    {editedEvent.sponsored_event && (
                      <div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        Sponsored Event
                      </div>
                    )}
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
                          value={editedEvent.address || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={editedEvent.city || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={editedEvent.state || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            value={editedEvent.latitude || ""}
                            onChange={handleNumberChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            value={editedEvent.longitude || ""}
                            onChange={handleNumberChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parking_details">Parking Details</Label>
                        <Textarea
                          id="parking_details"
                          name="parking_details"
                          value={editedEvent.parking_details || ""}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(editedEvent.address ||
                        editedEvent.city ||
                        editedEvent.state) && (
                        <div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div>
                              {editedEvent.address && (
                                <div>{editedEvent.address}</div>
                              )}
                              {(editedEvent.city || editedEvent.state) && (
                                <div>
                                  {[editedEvent.city, editedEvent.state]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {editedEvent.latitude && editedEvent.longitude && (
                        <div>
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              Coordinates
                            </span>
                            <div>
                              {editedEvent.latitude.toFixed(6)},{" "}
                              {editedEvent.longitude.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      )}

                      {editedEvent.parking_details && (
                        <div>
                          <h3 className="font-medium text-muted-foreground mb-2">
                            Parking Information
                          </h3>
                          <div className="flex items-start gap-2">
                            <Car className="h-4 w-4 mt-1 flex-shrink-0" />
                            <p className="whitespace-pre-line">
                              {editedEvent.parking_details}
                            </p>
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
                  {editedEvent.cover_image ? (
                    <img
                      src={editedEvent.cover_image}
                      alt={editedEvent.name}
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
      </Tabs>

      <DeleteEventModal
        eventId={event.id}
        eventName={event.name}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

// Internal DeleteEventModal component
function DeleteEventModal({
  eventId,
  eventName,
  isOpen,
  onClose,
  onSuccess,
}: {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete event");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the event "{eventName}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
