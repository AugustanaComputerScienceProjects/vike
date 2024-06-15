import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

export const toTitleCase = (str) => {
  return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const CalendarCard = ({ calendar }) => {
  return (
    <Card className="mt-2 mb-2 cursor-pointer">
      <div className="flex flex-col md:flex-row">
        <CardHeader>
          <CardTitle>{calendar.name}</CardTitle>
          <CardDescription>
            {calendar.subcribers || "No Subscriber"}
          </CardDescription>
          <CardDescription>Created by: {calendar.email}</CardDescription>
        </CardHeader>
        {calendar.profileUrl && (
          <div className="p-5">
            <img
              className="rounded-2xl aspect-square"
              src={calendar.profileUrl}
              alt={calendar.name}
              height={100}
              width={100}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalendarCard;
