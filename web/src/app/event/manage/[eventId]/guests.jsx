"use client";
import { Badge } from "@/components/ui";
import { EVENT_STATUS } from "@/lib/types";
import React from "react";

const Guests = ({ event }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case EVENT_STATUS.GOING:
        return "success";
      case EVENT_STATUS.CHECKED_IN:
        return "info";
      case EVENT_STATUS.INVITED:
        return "warning";
      case EVENT_STATUS.NOT_GOING:
        return "error";
      case EVENT_STATUS.WAITLISTED:
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case EVENT_STATUS.GOING:
        return "Going";
      case EVENT_STATUS.CHECKED_IN:
        return "Checked In";
      case EVENT_STATUS.INVITED:
        return "Invited";
      case EVENT_STATUS.NOT_GOING:
        return "Not Going";
      case EVENT_STATUS.WAITLISTED:
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
                variant={getStatusColor(userDetails.status)}
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
