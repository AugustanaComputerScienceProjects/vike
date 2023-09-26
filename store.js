import {create} from 'zustand';

export const useEventStore = create((set, get) => ({
  events: null,
  getCurrentEvent(id) {
    const {events} = get();
    const event = events.find(e => e.id === id);
    return event;
  },
  updateEvents: events => set(() => ({events})),
}));
