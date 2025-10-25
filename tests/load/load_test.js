/*
 * Load test script for the Online Examination System API.  This
 * script uses the k6 load testing tool (https://k6.io/).  It
 * performs a series of HTTP requests to the authentication
 * and exam endpoints to simulate concurrent users starting an
 * exam.  Adjust the URLs and payloads to match your deployed
 * environment and consider adding authentication headers once
 * JWT generation is implemented.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // number of virtual users
  duration: '30s', // test duration
};

export default function () {
  // Replace with your API base URL
  const baseUrl = __ENV.API_BASE_URL || 'http://localhost:5000/api';
  // Attempt to login (anonymous example)
  const loginPayload = JSON.stringify({ email: 'student@example.com', password: 'password123' });
  let res = http.post(`${baseUrl}/Auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'login status is 200 or 400': (r) => r.status === 200 || r.status === 400 });
  // If login succeeded, capture the token
  let token;
  try {
    token = res.json('accessToken');
  } catch (e) {
    token = null;
  }
  // Request the list of exams
  res = http.get(`${baseUrl}/Exams`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  check(res, { 'get exams status is 200': (r) => r.status === 200 });
  sleep(1);
}