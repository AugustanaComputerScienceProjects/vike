"use client";
import { Badge } from "@/components/ui";
import { EVENT_STATUS } from "@/lib/types";
import React from "react";
import { toTitleCase } from "./util";

const Guests = ({ event }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case EVENT_STATUS.GOING:
        return "green";
      case EVENT_STATUS.CHECKED_IN:
        return "blue";
      case EVENT_STATUS.INVITED:
        return "yellow";
      case EVENT_STATUS.NOT_GOING:
        return "red";
      default:
        return "gray";
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
                label={toTitleCase(userDetails.status)}
                color={getStatusColor(userDetails.status)}
                variant="outlined"
              />
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
