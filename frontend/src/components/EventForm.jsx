import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import useProfiles from "../hooks/useProfiles";
import { useStore } from "../store/useStore";
import { showToast } from "./Toast";

const commonTz = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  ,
];

export default function EventForm() {
  const { profiles, filteredProfiles, createProfile } = useProfiles();
  const {
    createEvent,
    selectedProfile: storeSelectedProfile,
    selectProfile,
  } = useStore();

  const [openProfiles, setOpenProfiles] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState(new Set());
  const [eventTimezone, setEventTimezone] = useState("UTC");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [manualSelection, setManualSelection] = useState(false);

  const [newName, setNewName] = useState("");
  const [newTz, setNewTz] = useState("UTC");

  const dropdownRef = useRef(null);
  const initializedFromStore = useRef(false);

  useEffect(() => {
    if (initializedFromStore.current) return;

    if (storeSelectedProfile) {
      setSelectedSet(new Set([storeSelectedProfile._id]));
      setEventTimezone(storeSelectedProfile.timezone || "UTC");
      setNewTz(storeSelectedProfile.timezone || "UTC");
    }

    initializedFromStore.current = true;
  }, [storeSelectedProfile]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfiles(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleProfile = useCallback((id) => {
    setSelectedSet((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
    setManualSelection(true);
  }, []);

  const selectedProfilesArray = useMemo(
    () => Array.from(selectedSet),
    [selectedSet]
  );
  const selectedCount = useMemo(() => selectedSet.size, [selectedSet]);

  const filtered = useMemo(
    () => filteredProfiles(query),
    [filteredProfiles, query]
  );

  const minNow = useCallback(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  }, []);

  const handleAddProfile = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const p = await createProfile(newName.trim(), newTz);
      setNewName("");
      setOpenProfiles(false);
    } catch (err) {
      console.error("Failed to create profile", err);
      showToast("Failed to create profile");
    }
  }, [createProfile, newName, newTz, selectProfile]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedProfilesArray.length) return;

      try {
        await createEvent({
          profiles: selectedProfilesArray,
          eventTimezone,
          startLocal,
          endLocal,
        });
        setStartLocal("");
        setEndLocal("");
        showToast("Event created successfully");
      } catch (err) {
        showToast("Failed to create event");
      }
    },
    [
      selectedProfilesArray,
      eventTimezone,
      startLocal,
      endLocal,
      createEvent,
    ]
  );

  return (
    <div>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700 }}>
        Create Event
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <label className="label">Profiles</label>
          <div
            className="select-like"
            onClick={() => setOpenProfiles((o) => !o)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              border: "1px solid #e6eef6",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <span>
              {selectedCount
                ? `${selectedCount} profile${
                    selectedCount > 1 ? "s" : ""
                  } selected`
                : "Select profiles..."}
            </span>
            <ChevronDown size={16} className="caret" />
          </div>

          {openProfiles && (
            <div className="profile-popover" style={{ left: 0, right: "auto" }}>
              <div style={{ padding: 8 }}>
                <input
                  placeholder="Search profiles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #e6eef6",
                  }}
                />
              </div>

              <div style={{ maxHeight: 220, overflow: "auto" }}>
                {filtered.length ? (
                  filtered.map((p) => (
                    <div
                      key={p._id}
                      className={`profile-row ${
                        selectedSet.has(p._id) ? "selected" : ""
                      }`}
                      onClick={() => toggleProfile(p._id)}
                    >
                      <div className="tick"/>
                       
                      <div style={{ marginLeft: 8 }}>
                        {p.name}
                        
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 12, color: "#94a3b8" }}>
                    No profiles
                  </div>
                )}
              </div>

              <hr style={{ margin: "8px 0" }} />
              <div
                style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8 }}
              >
                <input
                  placeholder="New profile name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #e6eef6",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddProfile}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>

              <div style={{ padding: 8 }}>
                <label
                  style={{ display: "block", fontSize: 12, color: "#374151" }}
                >
                  Timezone
                </label>
                <select
                  value={newTz}
                  onChange={(e) => setNewTz(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6 }}
                >
                  {commonTz.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Event Timezone</label>
          <select
            value={eventTimezone}
            onChange={(e) => setEventTimezone(e.target.value)}
          >
            {commonTz.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label className="label">Start (local)</label>
          <input
              type="datetime-local"
              value={startLocal}
              min={minNow()}
              onChange={(e) => setStartLocal(e.target.value)}
              required
            />
        </div>

         <div>
            <label className="label">End (local)</label>
         <input
              type="datetime-local"
              value={endLocal}
              min={startLocal || minNow()}
              onChange={(e) => setEndLocal(e.target.value)}
              required
            />
        </div>

        
        

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn-primary">
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}
