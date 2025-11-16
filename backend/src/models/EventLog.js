import mongoose from "mongoose";

const EventLogSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  changedByProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  timestampUTC: { type: Date, default: () => new Date() },
  diff: { type: Object },
});

const EventLog = mongoose.model("EventLog", EventLogSchema);
export default EventLog;
