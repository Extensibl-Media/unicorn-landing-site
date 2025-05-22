import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Save,
  X,
  Upload,
  MapPin,
  User,
  Heart,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

enum PersonalityStyles {
  BASIC_MOM = "BASIC_MOM_VIBES",
  BUSINESS = "BUSINESS",
  CLASSIC = "CLASSIC",
  FASHIONISTA = "FASHIONISTA",
  GRUNGE = "GRUNGE",
  HIPPIE = "HIPPIE",
  SPORTY = "SPORTY",
}

enum ProfileTypeSelect {
  COUPLE = "COUPLE",
  UNICORN = "UNICORN",
}

enum InterestedInSelect {
  COUPLES = "COUPLES",
  UNICORN = "UNICORNS",
  FRIENDS = "FRIENDS",
}

const InterestedInSelectOptions = [
  { label: "👩‍❤️‍👨 Couples", value: InterestedInSelect.COUPLES },
  { label: "🦄 Unicorns", value: InterestedInSelect.UNICORN },
  { label: "🤝 Friends", value: InterestedInSelect.FRIENDS },
];

const ProfileTypeSelectOptions = [
  { label: "Couple", value: ProfileTypeSelect.COUPLE },
  { label: "Unicorn", value: ProfileTypeSelect.UNICORN },
];

const PersonalityTypeSelectOptions = [
  { label: "Basic Mom Vibes", value: PersonalityStyles.BASIC_MOM },
  { label: "Business", value: PersonalityStyles.BUSINESS },
  { label: "Classic", value: PersonalityStyles.CLASSIC },
  { label: "Fashionista", value: PersonalityStyles.FASHIONISTA },
  { label: "Grunge", value: PersonalityStyles.GRUNGE },
  { label: "Hippie", value: PersonalityStyles.HIPPIE },
  { label: "Sporty", value: PersonalityStyles.SPORTY },
];

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

interface UserProfileEditFormProps {
  profile: Profile;
  onProfileUpdate?: (updatedProfile: Profile) => void;
  triggerButton?: React.ReactNode;
}

export function UserProfileEditForm({
  profile,
  onProfileUpdate,
  triggerButton,
}: UserProfileEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form data when profile changes
  useEffect(() => {
    console.log({ profile });
    setFormData(profile);
  }, [profile]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: keyof Profile, values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const toggleArrayItem = (field: keyof Profile, item: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    handleArrayChange(field, newArray);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/${profile.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile: formData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedProfile = await response.json();

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile.data || formData);
      }

      setSuccessMessage("Profile updated successfully!");

      // Close dialog after successful update
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleBirthdayChange = (birthday: string) => {
    const age = calculateAge(birthday);
    setFormData((prev) => ({
      ...prev,
      birthday,
      age,
    }));
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Edit Profile
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>
            Update user profile information and preferences
          </DialogDescription>
        </DialogHeader>

        {/* Status messages */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar_url || ""} />
                    <AvatarFallback>
                      {formData.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url || ""}
                      onChange={(e) =>
                        handleInputChange("avatar_url", e.target.value)
                      }
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username || ""}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile_type">Profile Type</Label>
                  <Select
                    value={formData.profile_type || ""}
                    onValueChange={(value) =>
                      handleInputChange("profile_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProfileTypeSelectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="looking_for">Looking For</Label>
                  <Select
                    value={formData.looking_for || ""}
                    onValueChange={(value) =>
                      handleInputChange("looking_for", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select what they're looking for" />
                    </SelectTrigger>
                    <SelectContent>
                      {ProfileTypeSelectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday || ""}
                    onChange={(e) => handleBirthdayChange(e.target.value)}
                  />
                  {formData.age && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Age: {formData.age} years
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      className="pl-10"
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_age_min">Minimum Age</Label>
                    <Input
                      id="preferred_age_min"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.preferred_age_min || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "preferred_age_min",
                          parseInt(e.target.value) || null
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferred_age_max">Maximum Age</Label>
                    <Input
                      id="preferred_age_max"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.preferred_age_max || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "preferred_age_max",
                          parseInt(e.target.value) || null
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio and Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bio & Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <Label htmlFor="ideal_match">Ideal Match</Label>
                  <Textarea
                    id="ideal_match"
                    rows={3}
                    value={formData.ideal_match || ""}
                    onChange={(e) =>
                      handleInputChange("ideal_match", e.target.value)
                    }
                    placeholder="Describe your ideal match..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personality Styles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Personality Styles
              </CardTitle>
              <CardDescription>
                Select personality traits that describe this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PersonalityTypeSelectOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      (formData.personality_style || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer hover:bg-pink-500/80",
                      (formData.personality_style || []).includes(
                        option.value
                      ) && "bg-pink-400"
                    )}
                    onClick={() =>
                      toggleArrayItem("personality_style", option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interested In */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interested In</CardTitle>
              <CardDescription>
                Select what this user is interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {InterestedInSelectOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      (formData.interested_in || []).includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer hover:bg-pink-500/80",
                      (formData.interested_in || []).includes(option.value) &&
                        "bg-pink-400"
                    )}
                    onClick={() =>
                      toggleArrayItem("interested_in", option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
