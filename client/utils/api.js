import axios from "axios";

export default axios.create({
  baseURL: "http://10.0.13.205", // <-- Replace with your machine’s local IP
});
