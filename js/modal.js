import { UI } from "./interface";

export function displayUpdateModal() {
  UI.modal.modalBackground.style.display = "block";
  UI.modal.modalContainer.style.display = "flex";
  UI.modal.updateModal.style.display = "block";
}

export function displayDeleteModal() {
  UI.modal.modalBackground.style.display = "block";
  UI.modal.modalContainer.style.display = "flex";
  UI.modal.deleteModal.style.display = "block";
}

export function hideModal() {
  UI.modal.modalBackground.style.display = "none";
  UI.modal.modalContainer.style.display = "none";
  UI.modal.updateModal.style.display = "none";
  UI.modal.deleteModal.style.display = "none";
}
