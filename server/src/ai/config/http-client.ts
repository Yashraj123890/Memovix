import axios from "axios";

export const AIHttpClient = axios.create({
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});