import axios from 'axios';
// If you run on a real device, set this to your machine's LAN IP.
// For Android emulator, 10.0.2.2 points to host machine; for iOS simulator, use localhost.

const BASE_URL = 'http://192.168.29.199:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export async function health() {
  const res = await api.get('/health');
  return res.data;
}
