import "./styles/style.scss";

const UI = {
  app: document.querySelector(".app"),
  alertBox: document.querySelector(".alertBox"),
  formButton: document.querySelector(".formButton"),
  form: {
    dateInput: document.querySelector(".dateInput"),
    cityInput: document.querySelector(".cityInput"),
    depNumInput: document.querySelector(".depNumInput"),
    placeInput: document.querySelector(".placeInput"),
    ticketsLinkInput: document.querySelector(".ticketsLinkInput"),
  },
  updateForm: {
    dateUpdateInput: document.querySelector(".dateUpdateInput"),
    cityUpdateInput: document.querySelector(".cityUpdateInput"),
    depNumUpdateInput: document.querySelector(".depNumUpdateInput"),
    placeUpdateInput: document.querySelector(".placeUpdateInput"),
    ticketsLinkUpdateInput: document.querySelector(".ticketsLinkUpdateInput"),
  },
  modal: {
    modalBackground: document.querySelector(".modalBackground"),
    modalContainer: document.querySelector(".modalContainer"),
    updateModal: document.querySelector(".updateModal"),
    deleteModal: document.querySelector(".deleteModal"),
    modalTitle: document.querySelector(".modalTitle"),
    yesButton: document.querySelector(".yesButton"),
    noButton: document.querySelector(".noButton"),
  },
};

const columns = {
  col1: document.getElementsByClassName("col1"),
  col2: document.getElementsByClassName("col2"),
  col3: document.getElementsByClassName("col3"),
  col4: document.getElementsByClassName("col4"),
  col5: document.getElementsByClassName("col5"),
  col6: document.getElementsByClassName("col6"),
};

let state = [];

function fetchData() {
  fetch("http://localhost:8070/concerts")
    .then((res) => {
      res
        .json()
        .then((data) => {
          state = formatState(data);
          console.log(state);
          renderApp();
        })
        .catch((error) => {});
    })
    .catch((error) => {});
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

fetchData();

function renderApp() {
  const listContainer = document.querySelector(".listContainer");
  listContainer.innerHTML = null;
  const concertListTitle = document.createElement("h2");
  concertListTitle.innerHTML = "Dates affichées sur le site";
  listContainer.appendChild(concertListTitle);
  state.forEach((date) => {
    listContainer.appendChild(addConcertsOfMonth(date));
  });
  alignList();
}

UI.formButton.addEventListener("click", submitConcert);

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

Object.keys(UI.form).forEach((key) => {
  UI.form[key].addEventListener("change", () => {
    if (UI.form[key].value) {
      UI.form[key].style.border = "1px solid #50b76d";
    } else {
      UI.form[key].style.border = "1px solid #f1f1f1";
    }
  });
});

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
    .catch((err) => {
      UI.alertBox.innerHTML = "Une erreur s'est produite.";
      displayErrorAlert();
    });
}

function resetForm(form) {
  Object.keys(form).forEach((key) => {
    form[key].value = null;
    form[key].style.border = "1px solid #f1f1f1";
  });
}

function resetUpdateForm(form) {
  Object.keys(form).forEach((key) => {
    form[key].style.border = "1px solid #161616";
  });
}

function formChecker(form) {
  let valid = true;
  Object.keys(form).forEach((key) => {
    if (form[key].required && !form[key].value) {
      form[key].style.border = "1px solid #e56c6c";
      valid = false;
    }
  });
  return valid;
}

function dateChecker(date) {
  let valid = true;
  const today = new Date().getTime();
  const concertDate = new Date(date).getTime();
  if (concertDate < today) {
    valid = false;
  }
  return valid;
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

function displayUpdateModal() {
  UI.modal.modalBackground.style.display = "block";
  UI.modal.modalContainer.style.display = "flex";
  UI.modal.updateModal.style.display = "block";
}

function displayDeleteModal() {
  UI.modal.modalBackground.style.display = "block";
  UI.modal.modalContainer.style.display = "flex";
  UI.modal.deleteModal.style.display = "block";
}

function hideModal() {
  UI.modal.modalBackground.style.display = "none";
  UI.modal.modalContainer.style.display = "none";
  UI.modal.updateModal.style.display = "none";
  UI.modal.deleteModal.style.display = "none";
}

function displaySuccessAlert() {
  UI.alertBox.setAttribute("class", "alertBox successAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

function displayErrorAlert() {
  UI.alertBox.setAttribute("class", "alertBox errorAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

function removeAlert() {
  UI.alertBox.style.top = "-64px";
  UI.alertBox.innerHTML = null;
  UI.alertBox.setAttribute("class", "alertBox");
}

function mongoAddConcert(concert) {
  return fetch(`http://localhost:8070/concerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

function mongoUpdateConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

function mongoDeleteConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}
