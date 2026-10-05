// API HELPER: all calls to our own Express backend live here.
const BASE = '/api/donors';

// Sends the request and throws an Error with the server's message if it fails.
async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const getDonors = () => request(BASE);
export const createDonor = (d) => request(BASE, json('POST', d));
export const updateDonor = (id, d) => request(`${BASE}/${id}`, json('PUT', d));
export const deleteDonor = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
