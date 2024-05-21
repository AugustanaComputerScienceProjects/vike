"use client";

import { Button, Input } from "@/components/ui";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import firebase from "@/firebase/config";
import { format } from "date-fns";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toTitleCase } from "../../manage/[eventId]/util";
import { EVENT_STATUS } from "./utils";

const CheckInPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState({});
  const [openQRScanner, setOpenQRScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const qrRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      if (fetchedEvent) setEvent(fetchedEvent);

      if (fetchedEvent.guests)
        setGuests(
          Object.entries(fetchedEvent.guests).map(
            ([userHandle, guestData]) => ({ userHandle, ...guestData })
          )
        );
    };

    fetchEvent();
  }, [eventId]);

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
  };

  const handleManualCheckIn = async () => {
    if (selectedGuest.userHandle) {
      const newStatus =
        selectedGuest.status === EVENT_STATUS.CHECKED_IN
          ? EVENT_STATUS.GOING
          : EVENT_STATUS.CHECKED_IN;
      await firebase.database
        .ref(
          `/current-events/${eventId}/guests/${selectedGuest.userHandle}/status`
        )
        .set(newStatus);
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      if (fetchedEvent && fetchedEvent.guests) {
        setGuests(
          Object.entries(fetchedEvent.guests).map(
            ([userHandle, guestData]) => ({ userHandle, ...guestData })
          )
        );
      }
      toast(`Status for ${selectedGuest.userHandle} updated successfully.`);
    }
  };

  const handleQRScan = async (result) => {
    if (result) {
      const ticketUserHandle = result.split("-")[0];
      const guest = guests.find(
        ({ userHandle }) => userHandle === ticketUserHandle
      );
      if (guest) {
        if (guest.userHandle) {
          await firebase.database
            .ref(`/current-events/${eventId}/guests/${guest.userHandle}/status`)
            .set(EVENT_STATUS.CHECKED_IN);
          const eventRef = firebase.database.ref(`/current-events/${eventId}`);
          const snapshot = await eventRef.once("value");
          const fetchedEvent = snapshot.val();
          if (fetchedEvent) {
            setGuests(
              Object.entries(fetchedEvent.guests).map(
                ([userHandle, guestData]) => ({ userHandle, ...guestData })
              )
            );
          }
          toast(`Checked in ${guest.userHandle} successfully!`);
        }
      }
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredGuests = guests.filter(({ userHandle }) =>
    userHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractTimestamp = (ticketId) => {
    const parts = ticketId.split("-");
    if (parts && parts.length > 0) {
      const timestamp = parts[parts.length - 1];
      if (timestamp) {
        return parseInt(timestamp, 10);
      }
    }
    return null;
  };

  const registrationDate = selectedGuest.ticketId
    ? extractTimestamp(selectedGuest.ticketId)
    : null;
  const formattedRegistrationDate = registrationDate
    ? format(new Date(registrationDate), "MMM d, yyyy h:mm a")
    : "";

  return (
    <div className="container">
      <div className="flex justify-between items-center">
        <div>
          <h2>{event?.name}</h2>
          <p>{event?.startDate}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Scan QR Code</Button>
          </DialogTrigger>
          <DialogContent>
            <Scanner
              onResult={handleQRScan}
              onError={(error) => console.log(error?.message)}
              options={{
                delayBetweenScanSuccess: 1000,
                delayBetweenScanAttempts: 1000,
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Input
        label="Search Guests"
        value={searchQuery}
        onChange={handleSearch}
        margin="normal"
      />
      <div className="flex flex-col gap-4">
        {filteredGuests.map(({ userHandle, status, ticketId }) => (
          <Dialog>
            <DialogTrigger asChild>
              <div
                key={userHandle}
                onClick={() =>
                  handleGuestClick({ userHandle, status, ticketId })
                }
              >
                <div className="flex justify-between items-center w-full">
                  <span>{userHandle}</span>
                  <span className="chip">{toTitleCase(status)}</span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <p>Registration Date: {formattedRegistrationDate}</p>
              <p>
                Status:{" "}
                {selectedGuest.status ? toTitleCase(selectedGuest.status) : ""}
              </p>
              <Button onClick={handleManualCheckIn}>
                {selectedGuest.status === EVENT_STATUS.CHECKED_IN
                  ? "Undo Check In"
                  : "Check In"}
              </Button>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default CheckInPage;
