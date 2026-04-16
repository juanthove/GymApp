import { apiRequest } from "./apiClient";

export async function getPersonalRecords() {
  return apiRequest("/api/personal-records");
}

export async function getPersonalRecordById(id) {
  return apiRequest(`/api/personal-records/${id}`);
}

export async function createPersonalRecord(personalRecord) {
  return apiRequest("/api/personal-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personalRecord)
  });
}

export async function updatePersonalRecord(id, personalRecord) {
  return apiRequest(`/api/personal-records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personalRecord)
  });
}

export async function deletePersonalRecord(id) {
  return apiRequest(`/api/personal-records/${id}`, {
    method: "DELETE"
  });
}

export async function checkPersonalRecord(userId, exerciseId, weight) {
  return apiRequest("/api/personal-records/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, exerciseId, weight })
  });
}
