import { UI } from "./interface";

export function displaySuccessAlert() {
  UI.alertBox.setAttribute("class", "alertBox successAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

export function displayErrorAlert() {
  UI.alertBox.setAttribute("class", "alertBox errorAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

function removeAlert() {
  UI.alertBox.style.top = "-64px";
  UI.alertBox.innerHTML = null;
  UI.alertBox.setAttribute("class", "alertBox");
}
