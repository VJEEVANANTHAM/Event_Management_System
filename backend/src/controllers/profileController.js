import jsonStorage from "../utils/jsonStorage.js";

export const createProfile = async (req, res) => {
  try {
    const { name, timezone } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    
    const profiles = jsonStorage.readProfiles();
    const newProfile = {
      _id: jsonStorage.generateId(),
      name,
      timezone: timezone || "UTC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(newProfile);
    jsonStorage.writeProfiles(profiles);
    
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listProfiles = async (req, res) => {
  try {
    const profiles = jsonStorage.readProfiles();
    const sorted = profiles.sort((a, b) => a.name.localeCompare(b.name));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { timezone, name } = req.body;
    
    let profiles = jsonStorage.readProfiles();
    const profile = profiles.find(p => p._id === id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    if (timezone) profile.timezone = timezone;
    if (name) profile.name = name;
    profile.updatedAt = new Date().toISOString();
    
    jsonStorage.writeProfiles(profiles);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
