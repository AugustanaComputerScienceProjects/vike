"use client";

import { Button, Input } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import firebase from "@/firebase/config";
import { EventGuest } from "@/firebase/types";
import { Scanner } from "@yudiel/react-qr-scanner";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { toTitleCase } from "../../manage/[eventId]/util";
import { EVENT_STATUS } from "./utils";

const CheckInPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState<{ userHandle: string, status: string }>({ userHandle: "", status: "" });
  const [openQRScanner, setOpenQRScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventRef = firebase.database.ref(`/current-events/${eventId}`);
        const snapshot = await eventRef.once("value");
        const fetchedEvent = snapshot.val();
        
        if (!fetchedEvent) {
          toast.error("Event not found");
          router.push("/events");
          return;
        }

        setEvent(fetchedEvent);
        if (fetchedEvent.guests) {
          setGuests(
            Object.entries(fetchedEvent.guests).map(
              ([userHandle, guestData]: [string, EventGuest]) => ({
                userHandle,
                status: guestData.status || EVENT_STATUS.GOING
              })
            )
          );
        }
      } catch (error) {
        toast.error("Failed to fetch event details");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  useEffect(() => {
    if (!eventId) return;

    const guestsRef = firebase.database.ref(`/current-events/${eventId}/guests`);
    
    const handleGuestsUpdate = (snapshot) => {
      const guestsData = snapshot.val();
      if (guestsData) {
        const updatedGuests = Object.entries(guestsData).map(
          ([userHandle, guestData]: [string, EventGuest]) => ({
            userHandle,
            status: guestData.status || EVENT_STATUS.GOING,
            ticketId: guestData.ticketId
          })
        );
        setGuests(updatedGuests);
      } else {
        setGuests([]);
      }
    };

    guestsRef.on("value", handleGuestsUpdate);

    return () => {
      guestsRef.off("value", handleGuestsUpdate);
    };
  }, [eventId]);

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
  };

  const handleManualCheckIn = async () => {
    if (!selectedGuest.userHandle) return;

    try {
      setIsLoading(true);
      const newStatus = selectedGuest.status === EVENT_STATUS.CHECKED_IN
        ? EVENT_STATUS.GOING
        : EVENT_STATUS.CHECKED_IN;

      await firebase.database
        .ref(`/current-events/${eventId}/guests/${selectedGuest.userHandle}/status`)
        .set(newStatus);

      // Optimistic update
      setGuests(prevGuests =>
        prevGuests.map(guest =>
          guest.userHandle === selectedGuest.userHandle
            ? { ...guest, status: newStatus }
            : guest
        )
      );

      toast.success(`${selectedGuest.userHandle} ${newStatus === EVENT_STATUS.CHECKED_IN ? 'checked in' : 'check-in undone'}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = useCallback(async (result) => {
    if (!result || isLoading || !scannerEnabled) return;
    
    const code = result.text || result;
    if (code === lastScannedCode) return; 
    
    try {
      setScannerEnabled(false); // Temporarily disable scanner
      setIsLoading(true);
      setLastScannedCode(code);
      
      const [ticketUserHandle] = code.split("-");
      
      const guestRef = firebase.database.ref(`/current-events/${eventId}/guests/${ticketUserHandle}`);
      const guestSnapshot = await guestRef.once("value");
      const guestData = guestSnapshot.val();

      if (!guestData) {
        toast.error("Guest not found");
        return;
      }

      await guestRef.update({
        status: EVENT_STATUS.CHECKED_IN
      });

      toast.success(`${ticketUserHandle} checked in successfully!`);
      
      // Reset scanner after successful scan
      setTimeout(() => {
        setLastScannedCode(null);
        setScannerEnabled(true);
      }, 2000); // 2 second cooldown between scans
      
    } catch (error) {
      toast.error("Failed to process QR code");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, isLoading, lastScannedCode, scannerEnabled]);

  const renderScanner = () => {
    if (!openQRScanner) return null;
    
    return (
      <Scanner
        key={scannerKey}
        onResult={handleQRScan}
        onError={(error) => {
          if (!error?.message?.includes('interrupted by a new load request')) {
            console.error(error?.message);
          }
        }}
        options={{
          delayBetweenScanSuccess: 1000,
          delayBetweenScanAttempts: 1000,
          constraints: {
            facingMode: "environment"
          }
        }}
      />
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case EVENT_STATUS.CHECKED_IN:
        return "bg-green-500";
      case EVENT_STATUS.GOING:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredGuests = guests.filter(({ userHandle }) =>
    userHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM d, yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const renderGuestDialog = (guest) => (
    <Dialog key={guest.userHandle}>
      <DialogTrigger asChild>
        <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex justify-between items-center">
            <span className="font-medium">{guest.userHandle}</span>
            <Badge variant="secondary" className={getStatusColor(guest.status)}>
              {toTitleCase(guest.status)}
            </Badge>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{guest.userHandle}</DialogTitle>
          <DialogDescription>
            Manage guest check-in status
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {guest.ticketId && (
            <div className="text-sm text-gray-500">
              Registered: {formatDate(parseInt(guest.ticketId.split("-").pop(), 10))}
            </div>
          )}
          <div className="text-sm">
            Current Status: <Badge variant="secondary" className={getStatusColor(guest.status)}>{toTitleCase(guest.status)}</Badge>
          </div>
          <Button 
            onClick={() => {
              handleGuestClick(guest);
              handleManualCheckIn();
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading 
              ? "Processing..." 
              : guest.status === EVENT_STATUS.CHECKED_IN 
                ? "Undo Check In" 
                : "Check In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{event?.name || "Loading..."}</h1>
          <p className="text-gray-500">{event?.startDate && formatDate(event.startDate)}</p>
        </div>
        <Dialog 
          open={openQRScanner} 
          onOpenChange={(open) => {
            setOpenQRScanner(open);
            if (!open) {
              setScannerKey(prev => prev + 1);
              setLastScannedCode(null);
              setScannerEnabled(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              {isLoading ? "Processing..." : "Scan QR Code"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Hold the QR code steady in front of the camera
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-square relative overflow-hidden rounded-md">
              {renderScanner()}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredGuests.map((guest) => renderGuestDialog(guest))}
        
        {filteredGuests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery 
              ? "No guests found matching your search" 
              : "No guests registered for this event"}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
