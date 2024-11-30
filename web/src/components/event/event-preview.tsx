"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import firebase from "@/firebase/config";
import { Event, EventStatus } from "@/firebase/types";
import { format } from "date-fns";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  QrCode,
  Ticket,
  X,
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { generateUniqueTicketId } from "./utils";

interface EventPreviewProps {
  event: Event;
  onClose?: () => void;
  onDelete?: () => Promise<void>;
  showActions?: boolean;
}

interface TicketDialogProps {
  showTicket: boolean;
  setShowTicket: (show: boolean) => void;
  event: Event;
}

const TicketDialog = ({ showTicket, setShowTicket, event }: TicketDialogProps) => {
  const currentUserHandle = firebase.auth.currentUser?.email?.split("@")[0];
  const ticketInfo = currentUserHandle ? event.guests?.[currentUserHandle] : null;

  if (!ticketInfo) {
    return (
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Ticket Found</DialogTitle>
            <DialogDescription>
              You are not registered for this event
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showTicket} onOpenChange={setShowTicket}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Ticket</DialogTitle>
          <DialogDescription>
            Show this QR code at the event check-in
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <QRCodeSVG
            value={ticketInfo.ticketId}
            size={200}
            level="H"
          />
          <div className="mt-4 text-center">
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-sm text-gray-600">
              {format(new Date(event.startDate), "h:mm a")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EventPreview = ({ event, onClose, onDelete, showActions = false }: EventPreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [showTicket, setShowTicket] = useState(false);

  const currentUserHandle = firebase.auth.currentUser?.email?.split("@")[0];
  const eventGuest = currentUserHandle && event.guests
    ? Object.entries(event.guests).find(
        ([userHandle]) => userHandle === currentUserHandle
      )
    : undefined;

  const status = eventGuest?.[1]?.status;
  const isRegistered = status === EventStatus.GOING || status === EventStatus.CHECKED_IN;

  useEffect(() => {
    const loadImage = async () => {
      if (!event.imgid || event.imgid === "default") {
        setIsLoadingImage(false);
        return;
      }

      try {
        const url = await firebase.storage
          .ref("Images")
          .child(`${event.imgid}.jpg`)
          .getDownloadURL();
        setImageUrl(url);
      } catch (error) {
        console.error("Error loading event image:", error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadImage();
  }, [event.imgid]);

  const handleRegister = async () => {
    if (!currentUserHandle) {
      toast.error("Please sign in to register for events");
      return;
    }

    try {
      const ticketId = generateUniqueTicketId(currentUserHandle, event.key);
      const eventRef = firebase.database.ref(`/current-events/${event.key}`);

      const updatedEvent = {
        ...event,
        guests: {
          ...event.guests,
          [currentUserHandle]: {
            ticketId,
            status: EventStatus.GOING,
          },
        },
      };

      await eventRef.update(updatedEvent);
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Failed to register. Please try again.");
    }
  };

  const handleCancelRegistration = async () => {
    if (!currentUserHandle) {
      toast.error("Please sign in to manage registrations");
      return;
    }

    try {
      const eventRef = firebase.database.ref(
        `/current-events/${event.key}/guests/${currentUserHandle}`
      );
      await eventRef.update({ status: EventStatus.NOT_GOING });
      toast.success("Registration cancelled successfully");
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Failed to cancel registration");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const formatDateForGoogle = (date: Date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    const googleUrl = new URL("https://calendar.google.com/calendar/render");
    googleUrl.searchParams.append("action", "TEMPLATE");
    googleUrl.searchParams.append("text", event.name);
    googleUrl.searchParams.append(
      "details",
      event.description?.replace(/<[^>]*>/g, "") || ""
    );
    googleUrl.searchParams.append("location", event.location || "");
    googleUrl.searchParams.append(
      "dates",
      `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`
    );

    window.open(googleUrl.toString(), "_blank");
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="relative h-[200px] p-0">
          {isLoadingImage ? (
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">{event.name}</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="h-5 w-5" />
              <span>
                {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span>
                {format(new Date(event.startDate), "h:mm a")} -{" "}
                {format(new Date(event.endDate), "h:mm a")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{event.location || "Location not specified"}</span>
            </div>

            {event.organization && (
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Organized by</h3>
                <p>{event.organization}</p>
              </div>
            )}

            {event.description && (
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Description</h3>
                <ScrollArea className="h-[100px]">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </ScrollArea>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(event.tags) ? event.tags : [event.tags]).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-2 p-4 border-t">
          <div className="flex gap-2">
            {isRegistered ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowTicket(true)}
                  className="flex items-center gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  View Ticket
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelRegistration}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel Registration
                </Button>
              </>
            ) : (
              <Button
                onClick={handleRegister}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Register
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Add to Calendar
            </Button>
          </div>
          <div className="flex gap-2">
            {showActions && onDelete && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      <TicketDialog
        showTicket={showTicket}
        setShowTicket={setShowTicket}
        event={event}
      />
    </>
  );
};

export default EventPreview;
