import { UI, columns } from "./interface";
import { mongoAddConcert, mongoUpdateConcert, mongoDeleteConcert } from "./api";
import { resetForm, resetUpdateForm, formChecker, dateChecker } from "./form";
import { displayUpdateModal, displayDeleteModal, hideModal } from "./modal";
import { displaySuccessAlert, displayErrorAlert } from "./alert";

let state = [];

(async function () {
  await verifySession();
  fetchData();
  attachEventListeners();
})();

async function verifySession() {
  const { status } = await fetch("http://localhost:8070/verify-session", {
    credentials: "include",
  });
  if (status === 401) {
    document.location.href = "/login";
  }
}

async function fetchData() {
  const response = await fetch("http://localhost:8070/concerts");
  const data = await response.json();
  state = formatState(data);
  renderApp();
}

function formatState(data) {
  return data
    .reduce((acc, value) => {
      const date = new Date(value.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const sameDate = acc.findIndex((date) => {
        return date.year === year && date.month === month;
      });
      if (sameDate === -1) {
        acc.push({ year, month, concerts: [value] });
      } else {
        acc[sameDate].concerts.push(value);
        acc[sameDate].concerts.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      }
      return acc;
    }, [])
    .sort((a, b) => {
      return new Date(a.year, a.month) - new Date(b.year, b.month);
    });
}

function attachEventListeners() {
  UI.disconnectButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await fetch("http://localhost:8070/logout", {
      credentials: "include",
    });
    document.location.href = "/login";
  });

  Object.keys(UI.form).forEach((key) => {
    UI.form[key].addEventListener("change", () => {
      if (UI.form[key].value) {
        UI.form[key].style.border = "1px solid #50b76d";
      } else {
        UI.form[key].style.border = "1px solid #f1f1f1";
      }
    });
  });

  UI.formButton.addEventListener("click", submitConcert);
}

function renderApp() {
  const listContainer = document.querySelector(".listContainer");
  listContainer.innerHTML = null;
  const concertListTitle = document.createElement("h2");
  concertListTitle.innerHTML = "Concerts affichés sur le site";
  listContainer.appendChild(concertListTitle);
  state.forEach((date) => {
    listContainer.appendChild(addConcertsOfMonth(date));
  });
  alignList();
}

function submitConcert(e) {
  e.preventDefault();
  if (!dateChecker(UI.form.dateInput.value)) {
    UI.form.dateInput.style.border = "1px solid #e56c6c";
    UI.alertBox.innerHTML = "La date renseignée est expirée.";
    displayErrorAlert();
    return;
  }
  if (!formChecker(UI.form)) {
    UI.alertBox.innerHTML = "Formulaire incomplet.";
    displayErrorAlert();
    return;
  }
  mongoAddConcert(createConcert())
    .then(() => {
      fetchData();
      UI.alertBox.innerHTML = "Date ajoutée avec succès.";
      displaySuccessAlert();
      resetForm(UI.form);
    })
    .catch((error) => {
      UI.alertBox.innerHTML = "Une erreur s'est produite.";
      displayErrorAlert();
    });
}

function createConcert() {
  const dateInputValue = new Date(UI.form.dateInput.value);
  const cityInputValue = UI.form.cityInput.value;
  const depNumInputValue = UI.form.depNumInput.value;
  const placeInputValue = UI.form.placeInput.value;
  const ticketsLinkInputValue = UI.form.ticketsLinkInput.value;
  const concert = {
    date: dateInputValue,
    city: cityInputValue,
    depNum: depNumInputValue,
    place: placeInputValue,
    ticketsLink: ticketsLinkInputValue,
  };
  return concert;
}

function addConcertsOfMonth(date) {
  const concertsOfMonth = document.createElement("div");
  const concertsOfMonthTitle = document.createElement("h3");
  concertsOfMonthTitle.setAttribute("class", "concertsOfMonthTitle");
  const month = new Date(date.year, date.month).toLocaleString("default", {
    month: "long",
  });
  concertsOfMonthTitle.innerHTML = `${month} ${date.year}`;
  concertsOfMonth.appendChild(concertsOfMonthTitle);
  const concertList = document.createElement("ul");
  concertList.setAttribute("class", "concertList");
  date.concerts.forEach((concert) => {
    concertList.appendChild(addConcert(concert));
  });
  concertsOfMonth.appendChild(concertList);
  return concertsOfMonth;
}

function addConcert(concert) {
  const concertTag = document.createElement("li");
  concertTag.setAttribute("class", "concert");
  if (concert.ticketsLink === "") {
    concertTag.innerHTML = `
      <span class="col1">${new Date(concert.date).toLocaleDateString(
        "fr-FR"
      )}</span>
      <span class="col2">${concert.city}</span>
      <span class="col3">${concert.depNum}</span>
      <span class="col4">${concert.place}</span>
      <span class="col5 unavailableTickets">Billetterie indisponible</span>
    `;
  } else {
    concertTag.innerHTML = `
      <span class="col1">${new Date(concert.date).toLocaleDateString(
        "fr-FR"
      )}</span>
      <span class="col2">${concert.city}</span>
      <span class="col3">${concert.depNum}</span>
      <span class="col4">${concert.place}</span>
      <span class="col5 availableTickets">Billetterie disponible
        <a href="${concert.ticketsLink}" target="_blank">
          <button class="ticketsLinkButton">Voir</button>
        </a>
      </span>
  `;
  }
  const editButtons = document.createElement("div");
  editButtons.setAttribute("class", "col6 editButtons");
  const updateButton = document.createElement("button");
  updateButton.setAttribute("class", "updateButton");
  updateButton.innerHTML = "Modifier";
  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("class", "deleteButton");
  deleteButton.innerHTML = "Supprimer";
  editButtons.appendChild(updateButton);
  editButtons.appendChild(deleteButton);
  concertTag.appendChild(editButtons);
  updateButton.addEventListener("click", () => {
    buildUpdateModal(concert);
  });
  deleteButton.addEventListener("click", () => {
    buildDeleteModal(concert);
  });
  return concertTag;
}

function buildUpdateModal(concert) {
  displayUpdateModal();
  const confirmButton = document.createElement("button");
  const cancelButton = document.createElement("button");
  confirmButton.setAttribute("class", "confirmButton");
  cancelButton.setAttribute("class", "cancelButton");
  confirmButton.innerHTML = "Modifier";
  cancelButton.innerHTML = "Annuler";
  UI.modal.updateModal.appendChild(confirmButton);
  UI.modal.updateModal.appendChild(cancelButton);
  UI.updateForm.dateUpdateInput.value = new Date(concert.date)
    .toISOString()
    .slice(0, 10);
  UI.updateForm.cityUpdateInput.value = concert.city;
  UI.updateForm.depNumUpdateInput.value = concert.depNum;
  UI.updateForm.placeUpdateInput.value = concert.place;
  if (!UI.updateForm.ticketsLinkUpdateInput.value) {
    concert.ticketsLink = null;
  } else {
    concert.ticketsLink = UI.updateForm.ticketsLinkUpdateInput.value;
  }
  confirmButton.addEventListener("click", (e) => {
    e.preventDefault();
    updateConcert(concert, confirmButton, cancelButton);
  });
  cancelButton.addEventListener("click", () => {
    hideModal();
    confirmButton.remove();
    cancelButton.remove();
    resetUpdateForm(UI.updateForm);
    fetchData();
  });
}

function updateConcert(concert, confirmButton, cancelButton) {
  concert.date = new Date(UI.updateForm.dateUpdateInput.value);
  concert.city = UI.updateForm.cityUpdateInput.value;
  concert.depNum = UI.updateForm.depNumUpdateInput.value;
  concert.place = UI.updateForm.placeUpdateInput.value;
  concert.ticketsLink = UI.updateForm.ticketsLinkUpdateInput.value;
  Object.keys(UI.updateForm).forEach((key) => {
    if (key != "ticketsLinkUpdateInput") {
      if (!UI.updateForm[key].value) {
        UI.updateForm[key].addEventListener("keydown", () => {
          UI.updateForm[key].style.border = "1px solid #50b76d";
        });
      }
    }
  });
  if (!dateChecker(UI.updateForm.dateUpdateInput.value)) {
    UI.updateForm.dateUpdateInput.style.border = "1px solid #e56c6c";
    UI.alertBox.innerHTML = "La date renseignée est expirée.";
    displayErrorAlert();
    return;
  }
  if (!formChecker(UI.updateForm)) {
    UI.alertBox.innerHTML = "Formulaire incomplet.";
    displayErrorAlert();
    return;
  }
  mongoUpdateConcert(concert)
    .then(() => {
      fetchData();
      UI.alertBox.innerHTML = "Date modifiée avec succès.";
      displaySuccessAlert();
      hideModal();
      resetUpdateForm(UI.updateForm);
      confirmButton.remove();
      cancelButton.remove();
    })
    .catch((error) => {
      UI.alertBox.innerHTML = "Une erreur s'est produite.";
      displayErrorAlert();
    });
}

function buildDeleteModal(concert) {
  displayDeleteModal();
  const yesButton = document.createElement("button");
  const noButton = document.createElement("button");
  yesButton.setAttribute("class", "yesButton");
  noButton.setAttribute("class", "noButton");
  yesButton.innerHTML = "Oui";
  noButton.innerHTML = "Non";
  UI.modal.deleteModal.appendChild(yesButton);
  UI.modal.deleteModal.appendChild(noButton);
  yesButton.addEventListener("click", () => {
    deleteConcert(concert, yesButton, noButton);
  });
  noButton.addEventListener("click", () => {
    hideModal();
    yesButton.remove();
    noButton.remove();
  });
}

function deleteConcert(concert, yesButton, noButton) {
  mongoDeleteConcert(concert)
    .then(() => {
      hideModal();
      yesButton.remove();
      noButton.remove();
      UI.alertBox.innerHTML = "Date supprimée avec succès.";
      displaySuccessAlert();
      fetchData();
    })
    .catch((error) => {
      UI.alertBox.innerHTML = "Une erreur s'est produite.";
      displayErrorAlert();
    });
}

function alignList() {
  Object.keys(columns).forEach((key) => {
    const columnsElements = Array.from(columns[key]);
    const widthColumnsElements = [];
    columnsElements.forEach((element) => {
      widthColumnsElements.push(element.getBoundingClientRect().width);
    });
    const largestColumnElement = Math.max(...widthColumnsElements);
    columnsElements.forEach((element) => {
      element.style.width = `${largestColumnElement}px`;
    });
  });
}
