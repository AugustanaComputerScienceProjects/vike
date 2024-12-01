"use client";

import { Badge } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Event, EventStatus } from "@/firebase/types";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Share2, Users } from "lucide-react";
import Image from "next/image";
import { formatDuration } from "./util";

interface OverviewProps {
  event: Event;
}

const CurrentEventOverview = ({ event }: { event: Event }) => {
  const guestCount = event.guests ? Object.keys(event.guests).length : 0;
  const registeredGuests = event.guests 
    ? Object.values(event.guests).filter(g => 
        g.status === EventStatus.GOING || g.status === EventStatus.CHECKED_IN
      ).length 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex gap-8">
          {/* Left side - Image */}
          <div className="w-1/3">
            <div className="relative aspect-[4/3] w-full">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Event Information */}
          <div className="w-2/3 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Share2 className="h-5 w-5" />
                <span>Hosted by {event.email}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">When & Where</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <div>
                    <div>{format(new Date(event.startDate), "h:mm a")}</div>
                    <div className="text-sm">Duration: {formatDuration(event.duration)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location || "Location not specified"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Attendance</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{registeredGuests} registered out of {guestCount} total guests</span>
              </div>
            </div>

            {event.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const PastEventOverview = ({ event }: { event: Event }) => {
  const guestCount = event.guests ? Object.keys(event.guests).length : 0;
  const checkedInGuests = event.guests 
    ? Object.values(event.guests).filter(g => g.status === EventStatus.CHECKED_IN).length 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">This Event Has Ended</h2>
            <p className="text-gray-600">Thank you for hosting. We hope it was a success!</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Recap</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{format(new Date(event.startDate), "EEEE, MMMM d")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p>{format(new Date(event.startDate), "h:mm a")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{event.location || "Offline"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p>{checkedInGuests} of {guestCount} checked in</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Guest Overview</h3>
            <div className="flex gap-2">
              {Object.values(EventStatus).map((status) => {
                const count = event.guests 
                  ? Object.values(event.guests).filter(g => g.status === status).length 
                  : 0;
                if (count === 0) return null;
                return (
                  <Badge key={status} variant="secondary">
                    {count} {status.toLowerCase()}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const Overview = ({ event }: OverviewProps) => {
  const eventDate = new Date(event.startDate);
  const isPastEvent = eventDate < new Date();

  return isPastEvent ? (
    <PastEventOverview event={event} />
  ) : (
    <CurrentEventOverview event={event} />
  );
};

export default Overview;
