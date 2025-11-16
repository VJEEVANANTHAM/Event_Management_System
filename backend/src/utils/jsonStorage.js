import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

// Initialize files if they don't exist
const initializeFiles = () => {
  if (!fs.existsSync(PROFILES_FILE)) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
  }
};

initializeFiles();

// Utility functions for reading/writing JSON files
const readProfiles = () => {
  return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));
};

const writeProfiles = (data) => {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
};

const readEvents = () => {
  return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
};

const writeEvents = (data) => {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2));
};

const readLogs = () => {
  return JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
};

const writeLogs = (data) => {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export default {
  readProfiles,
  writeProfiles,
  readEvents,
  writeEvents,
  readLogs,
  writeLogs,
  generateId,
};
