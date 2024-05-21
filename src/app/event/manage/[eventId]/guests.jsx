"use client";
import { Badge } from "@/components/ui";
import React from "react";
import { toTitleCase } from "./util";

const Guests = ({ event }) => {
  return (
    <>
      <div className="text-lg font-semibold">Guest List</div>
      {event?.guests ? (
        <div>
          {Object.entries(event.guests).map(([userHandle, userDetails]) => (
            <div
              key={userHandle}
              className="flex justify-between items-center border-b border-gray-200 py-2"
            >
              <div className="text-sm">{userHandle}</div>
              <Badge
                label={toTitleCase(userDetails.status)}
                color="green"
                variant="outlined"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-base">No guests yet.</div>
      )}
    </>
  );
};

export default Guests;
