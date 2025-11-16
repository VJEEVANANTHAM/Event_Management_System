require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Profile = require('../src/models/Profile');
const Event = require('../src/models/Event');
const EventLog = require('../src/models/EventLog');
const timeUtil = require('../src/utils/time');

async function run() {
  await connectDB();
  await Profile.deleteMany({});
  await Event.deleteMany({});
  await EventLog.deleteMany({});

  const a = await Profile.create({ name: 'user1', timezone: 'America/New_York' });
  const b = await Profile.create({ name: 'user2', timezone: 'Asia/Kolkata' });
  const c = await Profile.create({ name: 'user3', timezone: 'Europe/London' });

  const startUTC = timeUtil.localToUTC('2025-10-15T09:00', 'Asia/Kolkata');
  const endUTC = timeUtil.localToUTC('2025-10-17T09:00', 'Asia/Kolkata');

  const ev = await Event.create({
    title: 'Sample Conference',
    profiles: [a._id, b._id],
    eventTimezone: 'Asia/Kolkata',
    startUTC,
    endUTC,
    createdAtUTC: new Date(),
    updatedAtUTC: new Date()
  });

  await EventLog.create({ event: ev._id, changedByProfile: null, timestampUTC: new Date(), diff: { previous: null, current: { startUTC, endUTC, eventTimezone: 'Asia/Kolkata' } } });

  console.log('Seeded profiles and one event.'); process.exit(0);
}

run().catch(err=>{console.error(err); process.exit(1);});
