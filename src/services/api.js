import axios from "axios";

const api = axios.create({
  baseURL: "https://nasa-apps.herokuapp.com",
});

export default api;