"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventPreview from "./event-preview";

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
    <>
      <div className="border p-2 rounded-lg hover:border-gray-400">
        <div className="mt-2 mb-2 cursor-pointer" onClick={togglePreview}>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-7 md:col-span-9">
              <div className="p-2">
                <p className="text-sm text-gray-500">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
                <h6 className="text-lg font-semibold">{event.name}</h6>
                <p className="text-sm text-gray-500">
                  {event.location || "Location Missing"}
                </p>
              </div>
            </div>
            <div className="col-span-5 md:col-span-3 my-1 mr-1 relative w-[150px] h-[150px]">
              {event.imageUrl ? (
                <Image
                  className="rounded-lg object-cover"
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 text-sm text-center px-2">No image</p>
                </div>
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
            onClick={() => navigateTo(`/event/manage/${event.key}`)}
          >
            Manage
          </Button>
        </div>
      </div>

      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-2xl p-0">
          <EventPreview event={event} onClose={togglePreview} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
