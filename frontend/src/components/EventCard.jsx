import React, { useCallback, useMemo, useRef, useState } from "react";
import API from "../api/axios";
import { useStore } from "../store/useStore";
import { ChevronDown, Users } from "lucide-react";
import { showToast } from "./Toast";

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        {children}
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default function EventCard({ event }) {
  const { profiles, selectedProfile, updateEvent, createProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const sInitial = useMemo(() => convertToInput(event.start), [event.start]);
  const eInitial = useMemo(() => convertToInput(event.end), [event.end]);

  const [start, setStart] = useState(sInitial || "");
  const [end, setEnd] = useState(eInitial || "");
  const [title, setTitle] = useState(event.title || "");
  const [selectedSet, setSelectedSet] = useState(
    new Set(event.profiles.map((p) => p._id))
  );
  const [eventTimezone, setEventTimezone] = useState(
    event.eventTimezone || "UTC"
  );

  // dropdown state
  const [openProfiles, setOpenProfiles] = useState(false);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [newTz, setNewTz] = useState("UTC");
  const dropdownRef = useRef(null);

  const commonTz = [
    "UTC",
    "America/New_York",
    "America_Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Kolkata",
    "Asia/Tokyo",
  ].map((t) => t.replace("_", "/"));

  const filteredProfiles = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => p.name.toLowerCase().includes(q));
  }, [profiles, query]);

  function convertToInput(formatted) {
    try {
      const parsed = Date.parse(formatted);
      if (!isNaN(parsed)) {
        const date = new Date(parsed);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      }
    } catch (e) {}
    return "";
  }

  // Toggle selection
  const toggle = useCallback((id) => {
    setSelectedSet((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const profilesArr = Array.from(selectedSet);
      await updateEvent(event._id, {
        startLocal: start,
        endLocal: end,
        eventTimezone,
        title,
        profiles: profilesArr,
        changedBy: selectedProfile?._id || null,
      });
      setEditing(false);
      showToast("Event updated successfully");
    } catch (err) {
      showToast("Failed to update");
      console.error(err);
    }
  }, [
    updateEvent,
    event._id,
    start,
    end,
    eventTimezone,
    title,
    selectedSet,
    selectedProfile,
  ]);

  const handleAddProfile = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const p = await createProfile(newName.trim(), newTz || "UTC");
      setSelectedSet((prev) => {
        const s = new Set(prev);
        s.add(p._id);
        return s;
      });
      setNewName("");
      setNewTz("UTC");
      setOpenProfiles(false);
    } catch (err) {
      console.error("Failed to create profile", err);
      showToast("Failed to create profile");
    }
  }, [newName, newTz, createProfile]);

  const profileIds = (event.profiles || []).map((p) =>
    typeof p === "string" ? p : p._id
  );

  return (
    <div className="event-card hover-card">
      <div className="event-header">
        <div className="event-participants">
          <Users size={18} strokeWidth={1.8} />
          <span>
            {profileIds.length} participant{profileIds.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="event-actions">
          <button className="btn-primary" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn-secondary" onClick={() => setLogsOpen(true)}>
            View Logs
          </button>
        </div>
      </div>

      <div className="event-body">
        <div className="event-title">{event.title}</div>
        <div className="event-meta">
          {event.start} — {event.end} ({event.eventTimezone})
        </div>
        <div className="event-created-updated">Created: {event.createdAt}</div>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <h4>Edit Event</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <label>Profiles</label>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                className="select-like"
                onClick={() => setOpenProfiles((o) => !o)}
                style={{
                  border: "1px solid #e6eef6",
                  borderRadius: 6,
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                {selectedSet.size
                  ? `${selectedSet.size} profile${
                      selectedSet.size > 1 ? "s" : ""
                    } selected`
                  : "Select profiles..."}
                <ChevronDown size={16} className="caret" />
              </div>

              {openProfiles && (
                <div
                  className="profile-popover"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e6eef6",
                    borderRadius: 6,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    zIndex: 100,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  <div style={{ padding: 6 }}>
                    <input
                      placeholder="Search profiles..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #e6eef6",
                        fontSize: 12,
                      }}
                    />
                  </div>

                  <div>
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((p) => (
                        <div
                          key={p._id}
                          className={`profile-row ${
                            selectedSet.has(p._id) ? "selected" : ""
                          }`}
                          onClick={() => {
                            toggle(p._id);
                            setNewTz(p.timezone || "UTC");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 8px",
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          <div className="tick">
                          </div>
                          <div style={{ marginLeft: 6 }}>
                            <strong style={{ fontSize: 13 }}>{p.name}</strong>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{ padding: 8, color: "#94a3b8", fontSize: 12 }}
                      >
                        No profiles
                      </div>
                    )}
                  </div>

                  <hr style={{ margin: "6px 0" }} />
                  <div style={{ display: "flex", gap: 6, padding: 6 }}>
                    <input
                      placeholder="New profile name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #e6eef6",
                        fontSize: 12,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddProfile}
                      className="btn-primary"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                    >
                      Add
                    </button>
                  </div>

                  <div style={{ padding: "0 6px 6px 6px" }}>
                    <label style={{ fontSize: 12, color: "#374151" }}>
                      Timezone
                    </label>
                    <select
                      value={newTz}
                      onChange={(e) => setNewTz(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {[
                        "UTC",
                        "America/New_York",
                        "America/Chicago",
                        "America/Los_Angeles",
                        "Europe/London",
                        "Asia/Kolkata",
                        "Asia/Tokyo",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Start (local)</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />

            <label>End (local)</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Update Event
              </button>
            </div>
          </div>
        </Modal>
      )}

      {logsOpen && (
        <LogsModal
          eventId={event._id}
          tz={selectedProfile?.timezone || "UTC"}
          onClose={() => setLogsOpen(false)}
        />
      )}
    </div>
  );
}

function LogsModal({ eventId, tz, onClose }) {
  const [logs, setLogs] = React.useState(null);
  const { profilesById, getProfileById } = useStore();

  React.useEffect(() => {
    API.get(`/events/${eventId}/logs?tz=${tz}`)
      .then((res) => setLogs(res.data))
      .catch(() => setLogs([]));
  }, [eventId, tz]);

  const resolveName = (p) => {
    if (!p) return "";
    if (typeof p === "string") {
      return profilesById.get(p)?.name || p;
    }

    return p.name || p._id || String(p);
  };

  return (
    <Modal onClose={onClose}>
      <h4>Event Update History</h4>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {!logs && <div style={{ color: "#64748b" }}>Loading...</div>}
        {logs && logs.length === 0 && (
          <div style={{ color: "#64748b" }}>No update history yet</div>
        )}
        {logs &&
          logs.map((l) => {
            const prevProfiles =
              (l.diff.previous.profiles || []).map((p) => resolveName(p)) || [];
            const currProfiles =
              (l.diff.current.profiles || []).map((p) => resolveName(p)) || [];

            const added = currProfiles.filter(
              (name) => !prevProfiles.includes(name)
            );
            const removed = prevProfiles.filter(
              (name) => !currProfiles.includes(name)
            );

            const summaryParts = [];
            if (removed.length)
              summaryParts.push(`Removed: ${removed.join(", ")}`);
            if (added.length) summaryParts.push(`Added: ${added.join(", ")}`);

            return (
              <div
                key={l._id}
                style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {l.timestamp} {l.changedBy ? `by ${l.changedBy.name}` : ""}
                </div>

                {summaryParts.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    <strong>{summaryParts.join(" · ")}</strong>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginTop: 6,
                  }}
                >
                  {l.diff.previous.title !== l.diff.current.title && (
                    <div>
                      {" "}
                      <strong>Title:</strong> {l.diff.previous.title || "—"} →{" "}
                      {l.diff.current.title || "—"}{" "}
                    </div>
                  )}{" "}
                  {l.diff.previous.start !== l.diff.current.start && (
                    <div>
                      {" "}
                      <strong>Start:</strong> {l.diff.previous.start || "—"} →{" "}
                      {l.diff.current.start || "—"}{" "}
                    </div>
                  )}{" "}
                  {l.diff.previous.end !== l.diff.current.end && (
                    <div>
                      {" "}
                      <strong>End:</strong> {l.diff.previous.end || "—"} →{" "}
                      {l.diff.current.end || "—"}{" "}
                    </div>
                  )}{" "}
                  {l.diff.previous.eventTimezone !==
                    l.diff.current.eventTimezone && (
                    <div>
                      {" "}
                      <strong>Timezone:</strong>{" "}
                      {l.diff.previous.eventTimezone || "—"} →{" "}
                      {l.diff.current.eventTimezone || "—"}{" "}
                    </div>
                  )}
                  {added.length > 0 && (
                    <div>
                      <strong>Added Profiles:</strong> {added.join(", ")}
                    </div>
                  )}
                  {removed.length > 0 && (
                    <div>
                      <strong>Removed Profiles:</strong> {removed.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Modal>
  );
}
