"use client";
import { Badge, List, ListItem, Text } from "@/components/ui";
import React from "react";
import { toTitleCase } from "./util";

const Guests = ({ event }) => {
  return (
    <>
      <div className="text-lg font-semibold">Guest List</div>
      {event?.guests ? (
        <List>
          {Object.entries(event.guests).map(([userHandle, userDetails]) => (
            <ListItem
              key={userHandle}
              className="flex justify-between items-center border-b border-gray-200 py-2"
            >
              <Text>{userHandle}</Text>
              <Badge
                label={toTitleCase(userDetails.status)}
                color="green"
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <div className="text-base">No guests yet.</div>
      )}
    </>
  );
};

export default Guests;
