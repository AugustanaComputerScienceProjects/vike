"use client";
import { Badge } from "@/components/ui";
import { BadgeProps } from "@/components/ui/badge";
import { Event, EventStatus } from "@/firebase/types";

const Guests = ({ event }: { event: Event }) => {
  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.GOING:
        return "success";
      case EventStatus.CHECKED_IN:
        return "info";
      case EventStatus.INVITED:
        return "warning";
      case EventStatus.NOT_GOING:
        return "error";
      case EventStatus.WAITLISTED:
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case EventStatus.GOING:
        return "Going";
      case EventStatus.CHECKED_IN:
        return "Checked In";
      case EventStatus.INVITED:
        return "Invited";
      case EventStatus.NOT_GOING:
        return "Not Going";
      case EventStatus.WAITLISTED:
        return "Waitlisted";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Guest List</div>
      {event?.guests ? (
        <div className="space-y-2">
          {Object.entries(event.guests).map(([userHandle, userDetails]) => (
            <div
              key={userHandle}
              className="flex justify-between items-center border-b border-gray-200 py-2"
            >
              <div>
                <div className="text-sm font-medium">{userHandle}</div>
                {userDetails.ticketId && (
                  <div className="text-xs text-gray-500">
                    Ticket: {userDetails.ticketId}
                  </div>
                )}
              </div>
              <Badge
                variant={getStatusColor(userDetails.status) as BadgeProps["variant"]}
              >
                {getStatusLabel(userDetails.status)}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-base text-gray-500">No guests yet.</div>
      )}
    </div>
  );
};

export default Guests;
