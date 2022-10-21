import { UI } from "./interface";
import { logInRequest } from "../../js/api";

UI.loginButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const emailInputValue = UI.emailInput.value;
  const passwordInputValue = UI.passwordInput.value;
  const { status } = await logInRequest(emailInputValue, passwordInputValue);
  if (status === 400) {
    // erreur de saisie des ids
    return;
  }
  document.location.href = "/";
});
