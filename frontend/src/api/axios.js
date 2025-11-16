import axios from "axios";

const API = axios.create({
  baseURL: "https://event-management-system-backend-1vwr.onrender.com/api",
});

export default API;
