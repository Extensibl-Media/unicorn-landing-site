import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CalendarIcon, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

interface Club {
  id: string;
  name: string;
}

export function NewEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);

  useEffect(() => {
    // Fetch clubs for the dropdown
    const fetchClubs = async () => {
      try {
        const response = await fetch("/api/clubs");
        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }
        const { clubs } = await response.json();
        setClubs(clubs);
      } catch (err) {
        console.error("Error fetching clubs:", err);
      }
    };

    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      // Add date as ISO string
      if (date) {
        formData.append("date", date.toISOString());
      }

      // Handle club_id special case
      const clubId = formData.get("club_id");
      if (clubId === "none") {
        formData.delete("club_id");
      }

      // Add boolean values
      formData.append("all_day", isAllDay.toString());
      formData.append("sponsored_event", isSponsored.toString());

      // Ensure required fields have at least empty string values
      if (!formData.get("city")) formData.append("city", "");
      if (!formData.get("state")) formData.append("state", "");
      if (!formData.get("address")) formData.append("address", "");

      const response = await fetch("/admin/events/new", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create event");
        } catch (parseError) {
          throw new Error("Failed to create event");
        }
      }

      window.location.href = "/admin/events";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="club_id">Associated Club (Optional)</Label>
              <Select name="club_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select a club (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clubs?.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
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
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                checked={isAllDay}
                onCheckedChange={(checked) => setIsAllDay(checked === true)}
              />
              <Label htmlFor="all_day" className="cursor-pointer">
                All-day event
              </Label>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input id="start_time" name="start_time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" name="end_time" type="time" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image URL</Label>
              <Input
                id="cover_image"
                name="cover_image"
                type="url"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Enter event description here..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sponsored_event"
                checked={isSponsored}
                onCheckedChange={(checked) => setIsSponsored(checked === true)}
              />
              <Label htmlFor="sponsored_event" className="cursor-pointer">
                Sponsored Event
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" name="address" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select name="state">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama (AL)</SelectItem>
                    <SelectItem value="AK">Alaska (AK)</SelectItem>
                    <SelectItem value="AZ">Arizona (AZ)</SelectItem>
                    <SelectItem value="AR">Arkansas (AR)</SelectItem>
                    <SelectItem value="CA">California (CA)</SelectItem>
                    <SelectItem value="CO">Colorado (CO)</SelectItem>
                    <SelectItem value="CT">Connecticut (CT)</SelectItem>
                    <SelectItem value="DE">Delaware (DE)</SelectItem>
                    <SelectItem value="FL">Florida (FL)</SelectItem>
                    <SelectItem value="GA">Georgia (GA)</SelectItem>
                    <SelectItem value="HI">Hawaii (HI)</SelectItem>
                    <SelectItem value="ID">Idaho (ID)</SelectItem>
                    <SelectItem value="IL">Illinois (IL)</SelectItem>
                    <SelectItem value="IN">Indiana (IN)</SelectItem>
                    <SelectItem value="IA">Iowa (IA)</SelectItem>
                    <SelectItem value="KS">Kansas (KS)</SelectItem>
                    <SelectItem value="KY">Kentucky (KY)</SelectItem>
                    <SelectItem value="LA">Louisiana (LA)</SelectItem>
                    <SelectItem value="ME">Maine (ME)</SelectItem>
                    <SelectItem value="MD">Maryland (MD)</SelectItem>
                    <SelectItem value="MA">Massachusetts (MA)</SelectItem>
                    <SelectItem value="MI">Michigan (MI)</SelectItem>
                    <SelectItem value="MN">Minnesota (MN)</SelectItem>
                    <SelectItem value="MS">Mississippi (MS)</SelectItem>
                    <SelectItem value="MO">Missouri (MO)</SelectItem>
                    <SelectItem value="MT">Montana (MT)</SelectItem>
                    <SelectItem value="NE">Nebraska (NE)</SelectItem>
                    <SelectItem value="NV">Nevada (NV)</SelectItem>
                    <SelectItem value="NH">New Hampshire (NH)</SelectItem>
                    <SelectItem value="NJ">New Jersey (NJ)</SelectItem>
                    <SelectItem value="NM">New Mexico (NM)</SelectItem>
                    <SelectItem value="NY">New York (NY)</SelectItem>
                    <SelectItem value="NC">North Carolina (NC)</SelectItem>
                    <SelectItem value="ND">North Dakota (ND)</SelectItem>
                    <SelectItem value="OH">Ohio (OH)</SelectItem>
                    <SelectItem value="OK">Oklahoma (OK)</SelectItem>
                    <SelectItem value="OR">Oregon (OR)</SelectItem>
                    <SelectItem value="PA">Pennsylvania (PA)</SelectItem>
                    <SelectItem value="RI">Rhode Island (RI)</SelectItem>
                    <SelectItem value="SC">South Carolina (SC)</SelectItem>
                    <SelectItem value="SD">South Dakota (SD)</SelectItem>
                    <SelectItem value="TN">Tennessee (TN)</SelectItem>
                    <SelectItem value="TX">Texas (TX)</SelectItem>
                    <SelectItem value="UT">Utah (UT)</SelectItem>
                    <SelectItem value="VT">Vermont (VT)</SelectItem>
                    <SelectItem value="VA">Virginia (VA)</SelectItem>
                    <SelectItem value="WA">Washington (WA)</SelectItem>
                    <SelectItem value="WV">West Virginia (WV)</SelectItem>
                    <SelectItem value="WI">Wisconsin (WI)</SelectItem>
                    <SelectItem value="WY">Wyoming (WY)</SelectItem>
                    <SelectItem value="DC">
                      District of Columbia (DC)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" name="latitude" type="number" step="any" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lon">Longitude</Label>
                <Input id="lon" name="longitude" type="number" step="any" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking_details">
                Parking Details (Optional)
              </Label>
              <Textarea
                id="parking_details"
                name="parking_details"
                rows={3}
                placeholder="Enter parking information here..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_info">
                Additional Information (Optional)
              </Label>
              <Textarea
                id="additional_info"
                name="additional_info"
                rows={3}
                placeholder="Enter any additional event details here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = "/admin/events")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
