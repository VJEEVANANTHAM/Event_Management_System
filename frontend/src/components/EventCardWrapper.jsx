import useEventById from "../hooks/useEventById";
import EventCard from "./EventCard";

export default function EventCardWrapper({ eventId, style }) {
  const ev = useEventById(eventId);
  if (!ev) {
    return (
      <div style={style}>
        <div style={{ padding: 12, fontSize: 13, color: "#9ca3af" }}>
          Loading...
        </div>
      </div>
    );
  }
  return (
    <div style={style ? { ...style } : {}}>
      <EventCard event={ev} />
    </div>
  );
}
