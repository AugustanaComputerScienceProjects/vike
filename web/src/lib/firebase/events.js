import { auth, database } from "@/firebase/config";
import { get, ref, remove, set } from "firebase/database";

export const checkRegistrationStatus = async (eventId) => {
  if (!auth.currentUser) return false;
  
  const registrationRef = ref(
    database,
    `registrations/${eventId}/${auth.currentUser.uid}`
  );

  const snapshot = await get(registrationRef);
  return snapshot.exists();
};

export const registerForEvent = async (event) => {
  if (!auth.currentUser) {
    throw new Error("You must be logged in to register for events");
  }

  const registrationRef = ref(
    database,
    `registrations/${event.key}/${auth.currentUser.uid}`
  );

  const ticketId = `${event.key}-${auth.currentUser.uid}-${Date.now()}`;

  const registrationData = {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    eventId: event.key,
    eventName: event.name,
    registeredAt: new Date().toISOString(),
    ticketId: ticketId,
    status: "REGISTERED", // Can be REGISTERED, CHECKED_IN, CANCELLED
  };

  await set(registrationRef, registrationData);

  // Also add to user's registrations
  const userRegistrationRef = ref(
    database,
    `users/${auth.currentUser.uid}/registrations/${event.key}`
  );
  
  await set(userRegistrationRef, {
    eventId: event.key,
    ticketId: ticketId,
    registeredAt: registrationData.registeredAt,
  });

  return registrationData;
};

export const cancelEventRegistration = async (eventId) => {
  if (!auth.currentUser) {
    throw new Error("You must be logged in to cancel registrations");
  }

  const registrationRef = ref(
    database,
    `registrations/${eventId}/${auth.currentUser.uid}`
  );

  const userRegistrationRef = ref(
    database,
    `users/${auth.currentUser.uid}/registrations/${eventId}`
  );

  await remove(registrationRef);
  await remove(userRegistrationRef);
}; 