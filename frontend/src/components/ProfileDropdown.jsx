import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Users } from "lucide-react";
import useProfiles from "../hooks/useProfiles";
import { useStore } from "../store/useStore";
import { showToast } from "./Toast";

export default function ProfileDropdown() {
  const { profiles, filteredProfiles, createProfile, selectProfile } =
    useProfiles();
  const { selectedProfile } = useStore();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [tz, setTz] = useState("UTC");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = filteredProfiles(query);

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const p = await createProfile(newName.trim(), tz);
      setNewName("");
      setOpen(false);

      showToast(`Profile "${p.name}" created`);
    } catch (err) {
      console.error("Failed to create profile", err);
      showToast("Failed to create profile");
    }
  }, [createProfile, newName, tz]);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="profile-button"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        {selectedProfile ? (
          <>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {selectedProfile.name}
            </span>
            <ChevronDown size={16} className="caret" />
          </>
        ) : (
          <>
            <Users size={18} />
            <ChevronDown size={16} className="caret" />
          </>
        )}
      </button>

      {open && (
        <div className="profile-popover" role="dialog" aria-label="Profiles">
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

          <div style={{ maxHeight: 220, overflow: "auto" }} >
            {list.map((p) => (
              <div
                key={p._id}
                className="profile-row "
                onClick={() => {
                  selectProfile(p);
                  setOpen(false);
                }}
              >                      <div className="tick" />

                <div style={{ marginLeft: 8 }}>

                  {p.name}
                </div>
              </div>
            ))}

            {list.length === 0 && (
              <div style={{ padding: 12, color: "#94a3b8" }}>No profiles</div>
            )}
          </div>

          <hr style={{ margin: "8px 0" }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8 }}>
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
            <button onClick={handleAdd} className="btn-primary" type="button">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
