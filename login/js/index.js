const UI = {
  emailInput: document.getElementById("email"),
  passwordInput: document.getElementById("password"),
  loginButton: document.getElementById("loginButton"),
};

UI.loginButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const emailInputValue = UI.emailInput.value;
  const passwordInputValue = UI.passwordInput.value;
  const { status } = await logIn(emailInputValue, passwordInputValue);
  if (status === 400) {
    // erreur de saisie des ids
    return;
  }
  document.location.href = "/";
});

function logIn(email, password) {
  return fetch(`http://localhost:8070/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
}
