export default function request(url, options = {}) {
  return fetch(`${process.env.API_URL}${url}`, {
    credentials: "include",
    ...options,
  });
}
