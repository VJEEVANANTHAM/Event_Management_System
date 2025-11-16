import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, default: "Event" },
  profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
  eventTimezone: { type: String, required: true },
  startUTC: { type: Date, required: true },
  endUTC: { type: Date, required: true },
  createdAtUTC: { type: Date, default: () => new Date() },
  updatedAtUTC: { type: Date, default: () => new Date() },
});

const Event = mongoose.model("Event", EventSchema);
export default Event;
