import React from "react";
import useEvents from "../hooks/useEvents";
import EventCardWrapper from "./EventCardWrapper";
import * as RW from "react-window";

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function EventList() {
  const [viewTz, setViewTz] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  const { events, refresh, selectedProfile } = useEvents(viewTz);

  React.useEffect(() => {
    refresh();
  }, [refresh, selectedProfile, viewTz]);

  const itemSize = 140;
  const count = events ? events.length : 0;

  const listHeight = Math.min(
    600,
    Math.max(200, Math.min(count * itemSize, 600))
  );

  const List =
    RW.FixedSizeList ||
    RW.default?.FixedSizeList ||
    RW.default ||
    RW.VariableSizeList;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Events {selectedProfile ? `- ${selectedProfile.name}` : ""}</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 font-medium">View in Timezone</label>
          <select
            value={viewTz}
            onChange={(e) => setViewTz(e.target.value)}
            className="px-3  py-2 rounded-md border border-gray-200 text-sm min-w-[140px]"
          >
            {timezones.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        {(!events || events.length === 0) && (
          <div className="p-6 text-center text-gray-400 text-sm border border-dashed rounded-md bg-gray-50">
            No events found
          </div>
        )}

        {events && events.length > 0 && List && (
          <div className="grid">
            <List
              height={listHeight}
              itemCount={events.length}
              itemSize={itemSize}
              width="100%"
              style={{ overflowX: "hidden" }}
            >
              {({ index, style }) => {
                const ev = events[index];
                return (
                  <EventCardWrapper
                    key={ev._id}
                    eventId={ev._1d}
                    style={style}
                  />
                );
              }}
            </List>
          </div>
        )}

        {events && events.length > 0 && !List && (
          <div>
            {events.map((ev) => (
              <EventCardWrapper key={ev._id} eventId={ev._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
