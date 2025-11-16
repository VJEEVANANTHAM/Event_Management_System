import jsonStorage from "../utils/jsonStorage.js";
import timeUtil from "../utils/time.js";

export const createEvent = async (req, res) => {
  try {
    const { profiles, eventTimezone, startLocal, endLocal, title } = req.body;
    if (!profiles || !profiles.length)
      return res.status(400).json({ message: "Profiles required" });
    if (!eventTimezone)
      return res.status(400).json({ message: "eventTimezone required" });
    if (!startLocal || !endLocal)
      return res
        .status(400)
        .json({ message: "startLocal and endLocal required" });

    const startUTC = timeUtil.localToUTC(startLocal, eventTimezone);
    const endUTC = timeUtil.localToUTC(endLocal, eventTimezone);

    if (endUTC <= startUTC)
      return res
        .status(400)
        .json({ message: "Can't pick a date that has passed" });

    const events = jsonStorage.readEvents();
    const newEvent = {
      _id: jsonStorage.generateId(),
      title: title || "Event",
      profiles,
      eventTimezone,
      startUTC: startUTC.toISOString(),
      endUTC: endUTC.toISOString(),
      createdAtUTC: new Date().toISOString(),
      updatedAtUTC: new Date().toISOString(),
    };
    events.push(newEvent);
    jsonStorage.writeEvents(events);

    const logs = jsonStorage.readLogs();
    logs.push({
      _id: jsonStorage.generateId(),
      event: newEvent._id,
      changedByProfile: null,
      timestampUTC: new Date().toISOString(),
      diff: {
        previous: null,
        current: { startUTC, endUTC, eventTimezone, profiles, title },
      },
    });
    jsonStorage.writeLogs(logs);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error("createEvent err", err);
    res.status(500).json({ message: err.message });
  }
};

export const listEventsForProfile = async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const allProfiles = jsonStorage.readProfiles();
    const profile = allProfiles.find(p => p._id === profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const allEvents = jsonStorage.readEvents();
    const events = allEvents.filter(e => e.profiles.includes(profileId));

    const viewTz = req.query.tz || profile.timezone;

    const converted = events.map((ev) => ({
      _id: ev._id,
      title: ev.title,
      profiles: ev.profiles,
      eventTimezone: ev.eventTimezone,
      start: timeUtil.utcToTz(new Date(ev.startUTC), viewTz),
      end: timeUtil.utcToTz(new Date(ev.endUTC), viewTz),
      createdAt: timeUtil.utcToTz(new Date(ev.createdAtUTC), viewTz),
      updatedAt: timeUtil.utcToTz(new Date(ev.updatedAtUTC), viewTz),
    }));

    res.json({
      profile: {
        _id: profile._id,
        name: profile.name,
        timezone: profile.timezone,
      },
      events: converted,
    });
  } catch (err) {
    console.error("listEventsForProfile err", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { startLocal, endLocal, eventTimezone, profiles, title, changedBy } =
      req.body;

    let allEvents = jsonStorage.readEvents();
    const eventIndex = allEvents.findIndex(e => e._id === eventId);
    if (eventIndex === -1) return res.status(404).json({ message: "Event not found" });

    const ev = allEvents[eventIndex];

    const prev = {
      startUTC: ev.startUTC,
      endUTC: ev.endUTC,
      eventTimezone: ev.eventTimezone,
      profiles: ev.profiles,
      title: ev.title,
    };

    if (eventTimezone) ev.eventTimezone = eventTimezone;
    if (startLocal)
      ev.startUTC = timeUtil.localToUTC(startLocal, ev.eventTimezone).toISOString();
    if (endLocal) 
      ev.endUTC = timeUtil.localToUTC(endLocal, ev.eventTimezone).toISOString();
    if (profiles) ev.profiles = profiles;
    if (title) ev.title = title;

    const endDate = new Date(ev.endUTC);
    const startDate = new Date(ev.startUTC);
    if (endDate <= startDate)
      return res
        .status(400)
        .json({ message: "Can't pick a date that has passed" });

    ev.updatedAtUTC = new Date().toISOString();
    jsonStorage.writeEvents(allEvents);

    const logs = jsonStorage.readLogs();
    logs.push({
      _id: jsonStorage.generateId(),
      event: ev._id,
      changedByProfile: changedBy || null,
      timestampUTC: new Date().toISOString(),
      diff: {
        previous: prev,
        current: {
          startUTC: ev.startUTC,
          endUTC: ev.endUTC,
          eventTimezone: ev.eventTimezone,
          profiles: ev.profiles,
          title: ev.title,
        },
      },
    });
    jsonStorage.writeLogs(logs);

    res.json(ev);
  } catch (err) {
    console.error("updateEvent err", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEventLogs = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const tz = req.query.tz || "UTC";

    const allLogs = jsonStorage.readLogs();
    const logs = allLogs.filter(l => l.event === eventId);
    const allProfiles = jsonStorage.readProfiles();

    const converted = logs.map((l) => {
      const changedByProfile = allProfiles.find(p => p._id === l.changedByProfile);
      return {
        _id: l._id,
        changedBy: changedByProfile ? { _id: changedByProfile._id, name: changedByProfile.name } : null,
        timestamp: timeUtil.utcToTz(new Date(l.timestampUTC), tz),
        diff: (() => {
          const prev = l.diff.previous || {};
          const curr = l.diff.current || {};
          const conv = { previous: {}, current: {} };
          if (prev.startUTC)
            conv.previous.start = timeUtil.utcToTz(new Date(prev.startUTC), tz);
          if (prev.endUTC) conv.previous.end = timeUtil.utcToTz(new Date(prev.endUTC), tz);
          if (curr.startUTC)
            conv.current.start = timeUtil.utcToTz(new Date(curr.startUTC), tz);
          if (curr.endUTC) conv.current.end = timeUtil.utcToTz(new Date(curr.endUTC), tz);
          conv.previous.title = prev.title;
          conv.current.title = curr.title;
          conv.previous.eventTimezone = prev.eventTimezone;
          conv.current.eventTimezone = curr.eventTimezone;
          conv.previous.profiles = prev.profiles;
          conv.current.profiles = curr.profiles;
          return conv;
        })(),
      };
    });

    res.json(converted);
  } catch (err) {
    console.error("getEventLogs err", err);
    res.status(500).json({ message: err.message });
  }
};
