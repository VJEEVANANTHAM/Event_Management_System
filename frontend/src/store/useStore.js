import { create } from "zustand";
import API from "../api/axios";

export const useStore = create((set, get) => ({
  profiles: [],
  profilesById: new Map(),
  selectedProfile: null,
  events: [],
  eventsById: new Map(),
  loading: false,

  getProfileById: (id) => {
    return get().profilesById.get(id);
  },
  getEventById: (id) => {
    return get().eventsById.get(id);
  },

  _setEventsAndMap: (events) => {
    const byId = new Map(events.map((ev) => [ev._id, ev]));
    set({ events, eventsById: byId });
  },

  // Fetch profiles
  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const res = await API.get("/profiles");
      const profiles = res.data || [];
      const byId = new Map(profiles.map((p) => [p._id, p]));
      set({ profiles, profilesById: byId });

      if (profiles.length) {
        const current = profiles[0];
        set({ selectedProfile: current });
        get().fetchEventsForProfile(current._id);
      } else {
        set({ selectedProfile: null, events: [], eventsById: new Map() });
      }
    } catch (err) {
      console.error("fetchProfiles", err);
      set({ profiles: [], profilesById: new Map() });
    } finally {
      set({ loading: false });
    }
  },

  // Select profile
  selectProfile: async (profile) => {
    if (!profile) {
      set({ selectedProfile: null, events: [], eventsById: new Map() });
      return;
    }
    set({ selectedProfile: profile, events: [] });
    if (profile && profile._id) get().fetchEventsForProfile(profile._id);
  },

  // Create profile
  createProfile: async (name, timezone = "UTC") => {
    const res = await API.post("/profiles", { name, timezone });
    const newProfile = res.data;
    set((state) => {
      const newMap = new Map(state.profilesById);
      newMap.set(newProfile._id, newProfile);
      return {
        profiles: [...state.profiles, newProfile],
        profilesById: newMap,
      };
    });
    return newProfile;
  },

  // Update profile
  updateProfile: async (id, payload) => {
    const res = await API.put(`/profiles/${id}`, payload);
    const updated = res.data;
    set((state) => {
      const arr = state.profiles.map((p) => (p._id === id ? updated : p));
      const newMap = new Map(state.profilesById);
      newMap.set(id, updated);
      return { profiles: arr, profilesById: newMap, selectedProfile: updated };
    });

    if (updated && updated._id) get().fetchEventsForProfile(updated._id);
    return updated;
  },

  // Fetch events for a profile & build map
  fetchEventsForProfile: async (profileId, tz) => {
    try {
      const res = await API.get(
        `/events/profile/${profileId}` +
          (tz ? `?tz=${encodeURIComponent(tz)}` : "")
      );
      const events = res.data?.events || [];
      const byId = new Map(events.map((ev) => [ev._id, ev]));
      set({ events, eventsById: byId });
    } catch (err) {
      console.error("fetchEventsForProfile", err);
      set({ events: [], eventsById: new Map() });
    }
  },

  createEvent: async (payload) => {
    const tempId = "temp-" + Date.now();
    const profileIds = payload.profiles || [];

    const profilesObjects = profileIds.map((id) => {
      const fromStore = get().profilesById.get(id);
      return fromStore || { _id: id, name: id, timezone: "UTC" };
    });

    const tempEvent = {
      _id: tempId,
      title: payload.title || "Event",
      profiles: profilesObjects,
      eventTimezone: payload.eventTimezone || "UTC",
      start: payload.startLocal || "",
      end: payload.endLocal || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentSelectedId = get().selectedProfile?._id || null;
    const shouldInsertOptimistic =
      !currentSelectedId || profileIds.includes(currentSelectedId);

    if (shouldInsertOptimistic) {
      set((state) => {
        const newById = new Map(state.eventsById);
        newById.set(tempId, tempEvent);
        return {
          events: [tempEvent, ...(state.events || [])],
          eventsById: newById,
        };
      });
    }

    try {
      const res = await API.post("/events", payload);
      const created = res.data;

      const createdIds = (created.profiles || []).map((p) =>
        typeof p === "string" ? p : p._id
      );

      if (shouldInsertOptimistic) {
        set((state) => {
          const newById = new Map(state.eventsById);
          newById.delete(tempId);
          newById.set(created._id, created);
          const newEvents = (state.events || []).map((e) =>
            e._id === tempId ? created : e
          );

          const exists = newEvents.find((e) => e._id === created._id);
          const finalEvents = exists ? newEvents : [created, ...newEvents];

          return { events: finalEvents, eventsById: newById };
        });
      } else {
        const profile = get().selectedProfile;
        if (profile && createdIds.includes(profile._id)) {
          await get().fetchEventsForProfile(profile._id);
        }
      }

      return created;
    } catch (err) {
      if (shouldInsertOptimistic) {
        set((state) => {
          const evs = (state.events || []).filter((e) => e._id !== tempId);
          const newById = new Map(state.eventsById);
          newById.delete(tempId);
          return { events: evs, eventsById: newById };
        });
      }
      throw err;
    }
  },

  updateEvent: async (eventId, payload) => {
    const prev = get().eventsById.get(eventId);
    if (!prev) {
      try {
        await API.put(`/events/${eventId}`, payload);
        const profile = get().selectedProfile;
        if (profile) await get().fetchEventsForProfile(profile._id);
      } catch (err) {
        throw err;
      }
      return;
    }

    const updated = { ...prev };
    if (payload.title !== undefined) updated.title = payload.title;
    if (payload.eventTimezone !== undefined)
      updated.eventTimezone = payload.eventTimezone;
    if (payload.startLocal !== undefined) updated.start = payload.startLocal;
    if (payload.endLocal !== undefined) updated.end = payload.endLocal;
    if (payload.profiles !== undefined) {
      updated.profiles = payload.profiles.map((id) => {
        const prof = get().profilesById.get(id);
        return prof || { _id: id, name: id, timezone: "UTC" };
      });
    }
    updated.updatedAt = new Date().toISOString();

    set((state) => {
      const newById = new Map(state.eventsById);
      newById.set(eventId, updated);
      const newEvents = state.events.map((e) =>
        e._id === eventId ? updated : e
      );
      return { events: newEvents, eventsById: newById };
    });

    try {
      await API.put(`/events/${eventId}`, payload);
      const profile = get().selectedProfile;
      if (profile) await get().fetchEventsForProfile(profile._id);
    } catch (err) {
      set((state) => {
        const newById = new Map(state.eventsById);
        newById.set(eventId, prev);
        const newEvents = state.events.map((e) =>
          e._id === eventId ? prev : e
        );
        return { events: newEvents, eventsById: newById };
      });
      throw err;
    }
  },
}));
