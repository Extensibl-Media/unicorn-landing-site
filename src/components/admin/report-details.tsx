import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
  Calendar,
  Flag,
  Shield,
  UserX,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  XCircle,
  AlarmClock,
} from "lucide-react";
import { format } from "date-fns";

interface ReportDetailsProps {
  report: any; // The complete report with joined user data
  otherReports: any[]; // Other reports for the same user
}

export function ReportDetails({ report, otherReports }: ReportDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOtherReports, setShowOtherReports] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState(
    `Warning regarding your account activity`,
  );

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/reports/${report.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update report status");
      }

      setSuccessMessage(`Report marked as ${newStatus.toLowerCase()}`);
      // Update report status locally
      report.report_status = newStatus;
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
      // Call the block user endpoint
      const response = await fetch(`/api/users/${report.profile_id}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to block user");
      }

      setSuccessMessage("User has been blocked and removed from the platform");

      // Also mark the report as resolved
      await handleStatusChange("RESOLVED");

      // Redirect back to reports list after a delay
      setTimeout(() => {
        window.location.href = "/admin/reported-users";
      }, 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
      setIsBlockDialogOpen(false);
    }
  };

  const handleSendWarning = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Call the API to send a warning email
      const response = await fetch(`/api/users/${report.profile_id}/warn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          reportId: report.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send warning email");
      }

      setSuccessMessage("Warning email sent successfully");

      // Mark the report as resolved
      await handleStatusChange("RESOLVED");

      // Clear form fields
      setEmailMessage("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-green-500 hover:bg-green-500">Resolved</Badge>
        );
      case "CLOSED":
        return <Badge className="bg-gray-500 hover:bg-gray-500">Closed</Badge>;
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-500">Pending</Badge>
        );
    }
  };

  const reportedProfile = report.reported_profile || {};
  const reporterProfile = report.reporter_profile || {};

  return (
    <>
      {/* Status messages */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Report Information</CardTitle>
                <CardDescription>
                  Submitted on {formatDate(report.created_at)}
                </CardDescription>
              </div>
              <div>{getStatusBadge(report.report_status)}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-base font-medium">Reason for Report</p>
              <p className="text-lg font-semibold mt-1">{report.reason}</p>
            </div>

            <div>
              <p className="text-base font-medium">Details</p>
              <div className="mt-1 bg-muted p-4 rounded-md whitespace-pre-line">
                {report.details}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Reported By
                </h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={reporterProfile.avatar_url || ""}
                      alt={reporterProfile.username || "User"}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{reporterProfile.username || "Unknown User"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Report Status
                </h3>
                <div className="flex items-center gap-2">
                  <AlarmClock className="h-4 w-4 text-muted-foreground" />
                  <span>{report.report_status}</span>
                </div>
              </div>
            </div>

            {/* Other reports for this user */}
            {otherReports.length > 0 && (
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer py-2"
                  onClick={() => setShowOtherReports(!showOtherReports)}
                >
                  <h3 className="text-lg font-medium flex items-center">
                    <Flag className="h-5 w-5 mr-2 text-red-500" />
                    Other Reports for This User ({otherReports.length})
                  </h3>
                  {showOtherReports ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {showOtherReports && (
                  <div className="mt-2 border rounded-md">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Reason</th>
                          <th className="px-4 py-2 text-left">Reported By</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherReports.map((report) => (
                          <tr key={report.id} className="border-t">
                            <td className="px-4 py-2">
                              {format(
                                new Date(report.created_at),
                                "MMM d, yyyy",
                              )}
                            </td>
                            <td className="px-4 py-2">{report.reason}</td>
                            <td className="px-4 py-2">
                              {report.reporter_profile?.username || "Unknown"}
                            </td>
                            <td className="px-4 py-2">
                              {getStatusBadge(report.report_status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="flex flex-wrap gap-2">
              {report.report_status === "PENDING" && (
                <>
                  <Button
                    className="w-full sm:w-fit"
                    variant="outline"
                    onClick={() => handleStatusChange("RESOLVED")}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                  <Button
                    className="w-full sm:w-fit"
                    variant="outline"
                    onClick={() => handleStatusChange("CLOSED")}
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Report
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Reported User & Actions */}
        <div className="space-y-6">
          {/* Reported User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Reported User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={reportedProfile.avatar_url || ""}
                    alt={reportedProfile.username || "User"}
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    {reportedProfile.username || "Unknown User"}
                  </h3>
                  <p className="text-muted-foreground">
                    {reportedProfile.email || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined{" "}
                    {reportedProfile.created_at
                      ? format(
                          new Date(reportedProfile.created_at),
                          "MMMM d, yyyy",
                        )
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {reportedProfile.approved
                      ? "Account Approved"
                      : "Account Not Approved"}
                    {reportedProfile.verified && " • Verified"}
                  </span>
                </div>
                {reportedProfile.profile_type && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Type: {reportedProfile.profile_type}</span>
                  </div>
                )}
              </div>

              {reportedProfile.bio && (
                <div>
                  <h4 className="font-medium mb-1">Bio</h4>
                  <p className="text-sm text-muted-foreground">
                    {reportedProfile.bio.length > 150
                      ? `${reportedProfile.bio.substring(0, 150)}...`
                      : reportedProfile.bio}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(`/admin/users/${reportedProfile.id}`, "_blank")
                }
              >
                View Full Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Warning email form */}
          {report.report_status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Send Warning</CardTitle>
                <CardDescription>
                  Send a warning email to the user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-1"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Write a warning message to the user..."
                      rows={6}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSendWarning}
                  disabled={isSubmitting || !emailMessage.trim()}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Warning
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Block User Action */}
          {report.report_status === "PENDING" && (
            <Card className="border-red-200">
              <CardHeader className="text-red-800">
                <CardTitle>Block User</CardTitle>
                <CardDescription className="text-red-700">
                  This action will permanently remove the user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Blocking will remove this user and all their data from the
                  platform. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsBlockDialogOpen(true)}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Block User
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to block this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the user "{reportedProfile.username}"
              and all their data from the platform. This action cannot be
              undone.
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
              {isSubmitting ? "Blocking..." : "Block User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
