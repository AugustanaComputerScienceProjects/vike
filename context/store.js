import database from '@react-native-firebase/database';
import {create} from 'zustand';
import {getStorageImgURL} from '../app/(tabs)/discover';

export const useEventStore = create((set, get) => ({
  events: null,
  getCurrentEvent(id) {
    const {events} = get();
    const event = events.find(e => e.id === id);
    return event;
  },
  fetchEvents: () => {
    database()
      .ref('/current-events')
      .on('value', async snapshot => {
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
      });
  },
  updateEvents: events => set(() => ({events})),
}));
