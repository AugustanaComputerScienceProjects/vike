"use client";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "./ui/button";

const EventCard = ({ event }) => {
  const [openPreview, setOpenPreview] = useState(false);
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(path);
  };

  const togglePreview = () => {
    setOpenPreview(!openPreview);
  };

  return (
    <div className="border p-2 rounded-lg hover:border-gray-400">
      <div className="mt-2 mb-2 cursor-pointer" onClick={togglePreview}>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7 md:col-span-9">
            <div className="p-2">
              <p className="text-sm text-gray-500">
                {format(new Date(event.startDate), "h:mm a")}
              </p>
              <h6 className="text-lg">{event.name}</h6>
              <p className="text-sm text-gray-500">
                {event.location || "Location Missing"}
              </p>
            </div>
          </div>
          <div className="col-span-5 md:col-span-3 my-1 mr-1 relative w-[150px] h-[150px]">
            {event.imageUrl && (
              <Image
                className="rounded-lg object-cover"
                src={event.imageUrl}
                alt={event.name}
                layout="fill"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center px-4 py-2 gap-2">
        <Button onClick={() => navigateTo(`/event/check-in/${event.key}`)}>
          Check In
        </Button>
        <Button
          variant="outline"
          onClick={() => navigateTo(`event/manage/${event.key}`)}
        >
          Manage
        </Button>
      </div>

      {openPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg max-w-lg mx-auto">
            {/* Placeholder for EventPreview component */}
            <p>Event Preview: {event.name}</p>
            <button
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={togglePreview}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
