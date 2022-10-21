export function mongoAddConcert(concert) {
  return fetch(`http://localhost:8070/concerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
    credentials: "include",
  });
}

export function mongoUpdateConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
    credentials: "include",
  });
}

export function mongoDeleteConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
}
