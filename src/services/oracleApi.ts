import axios from "axios";

export const oracleApi = axios.create({
  baseURL: "https://api.oraclegames.live/api",
  headers: {
    "x-api-key": "20afffdf-98c4-4de3-a16f-7d3f29cbd90e",
  },
});