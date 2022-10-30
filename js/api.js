import request from "./services/request";

export function getConcertsRequest() {
  return request("/concerts");
}

export function addConcertRequest(concert) {
  return request("/concerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

export function updateConcertRequest(concert) {
  return request(`/concerts/${concert._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

export function deleteConcertRequest(concert) {
  return request(`/concerts/${concert._id}`, {
    method: "DELETE",
  });
}

export function logInRequest(email, password) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function verifySessionRequest() {
  return request("/verify-session");
}

export function logOutRequest() {
  return request("/logout");
}
