import database from '@react-native-firebase/database';
import {create} from 'zustand';
import {getStorageImgURL} from '../app/(tabs)/home';

export const useEventStore = create((set, get) => ({
  events: null,
  getCurrentEvent(id) {
    const {events} = get();
    const event = events.find(e => e.id === id);
    return event;
  },
  fetchEvents: async () => {
    const snapshot = await database().ref('/current-events').once('value');
    const events = snapshot.val();
    const resolved = await Promise.all(
      Object.entries(events).map(async ([key, value]) => {
        const imgURL = await getStorageImgURL(value.imgid);
        return {
          id: key,
          image: imgURL,
          ...value,
        };
      }),
    );
    set(() => ({events: resolved}));
  },
  updateEvents: events => set(() => ({events})),
}));
