const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const apiLogin = (username, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ username, password }),
  }).then(handleRes);

export const apiRegister = (form) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(form),
  }).then(handleRes);

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffGetDashboard = () =>
  fetch(`${BASE_URL}/staff/dashboard`, { headers: headers() }).then(handleRes);

export const staffGetDonors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/staff/donors${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};

export const staffRegisterDonor = (body) =>
  fetch(`${BASE_URL}/staff/donors`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const staffUpdateDonor = (id, body) =>
  fetch(`${BASE_URL}/staff/donors/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

  export const staffLogDonation = (donor_id, body) =>
  fetch(`${BASE_URL}/staff/donations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ donor_id, ...body }),
  }).then(handleRes);
  
// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetDashboard = () =>
  fetch(`${BASE_URL}/admin/dashboard`, { headers: headers() }).then(handleRes);

export const adminGetDonors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/admin/donors${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};

export const adminUpdateDonor = (id, body) =>
  fetch(`${BASE_URL}/admin/donors/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const adminDeleteDonor = (id) =>
  fetch(`${BASE_URL}/admin/donors/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then(handleRes);

  export const adminGetBloodStockOverview = () =>
  fetch(`${BASE_URL}/admin/blood-stock`, {
    headers: headers(),
  }).then(handleRes);

  export const adminGetBloodStock = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/admin/blood-stock/batches${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};

export const adminAddBloodStock = (body) =>
  fetch(`${BASE_URL}/admin/blood-stock`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const adminAdjustBloodStock = (id, new_units) =>
  fetch(`${BASE_URL}/admin/blood-stock/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ new_units }),
  }).then(handleRes);

export const adminGetRequests = () =>
  fetch(`${BASE_URL}/admin/requests`, { headers: headers() }).then(handleRes);

export const adminApproveRequest = (id) =>
  fetch(`${BASE_URL}/admin/requests/${id}/approve`, {
    method: "PATCH",
    headers: headers(),
  }).then(handleRes);

export const adminRejectRequest = (id, reason) =>
  fetch(`${BASE_URL}/admin/requests/${id}/reject`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ reason }),
  }).then(handleRes);

export const adminGetTransactions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/admin/transactions${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};

export const adminGetStaff = () =>
  fetch(`${BASE_URL}/admin/staff`, { headers: headers() }).then(handleRes);

export const adminCreateStaff = (body) =>
  fetch(`${BASE_URL}/admin/staff`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const adminDeleteStaff = (id) =>
  fetch(`${BASE_URL}/admin/staff/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then(handleRes);

// ── Customer ──────────────────────────────────────────────────────────────────
export const customerGetRequests = () =>
  fetch(`${BASE_URL}/customer/requests`, { headers: headers() }).then(handleRes);

export const customerSubmitRequest = (body) =>
  fetch(`${BASE_URL}/customer/request`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const customerGetBloodAvailability = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/customer/blood-availability${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};

export const customerGetDonors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/customer/donors${qs ? "?" + qs : ""}`, {
    headers: headers(),
  }).then(handleRes);
};
