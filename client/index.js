import "./style.scss";

const UI = {
  app: document.querySelector("#app"),
  alertBox: document.querySelector("#alertBox"),
  formButton: document.querySelector("#formButton"),
  form: {
    dateInput: document.querySelector("#dateInput"),
    cityInput: document.querySelector("#cityInput"),
    depNumInput: document.querySelector("#depNumInput"),
    placeInput: document.querySelector("#placeInput"),
    ticketsLinkInput: document.querySelector("#ticketsLinkInput"),
  },
  modalBackground: document.createElement("div"),
  modalContainer: document.createElement("div"),
  modalAlert: document.createElement("div"),
  modalTitle: document.createElement("h3"),
  updateForm: document.createElement("form"),
  yesButton: document.createElement("button"),
  noButton: document.createElement("button"),
};

UI.modalTitle.setAttribute("id", "modalTitle");
UI.updateForm.setAttribute("id", "updateForm");
UI.yesButton.setAttribute("id", "yesButton");
UI.noButton.setAttribute("id", "noButton");

const columns = {
  col1: document.getElementsByClassName("col1"),
  col2: document.getElementsByClassName("col2"),
  col3: document.getElementsByClassName("col3"),
  col4: document.getElementsByClassName("col4"),
  col5: document.getElementsByClassName("col5"),
  col6: document.getElementsByClassName("col6"),
};

function fetchData() {
  fetch("http://localhost:8070/concerts")
    .then(function (res) {
      res
        .json()
        .then(function (data) {
          state = data;
          renderApp();
        })
        .catch(function (error) {});
    })
    .catch(function (error) {});
}

fetchData();

function renderApp() {
  const listContainer = document.querySelector("#listContainer");
  listContainer.innerHTML = null;
  const concertListTitle = document.createElement("h2");
  concertListTitle.innerHTML = "Dates affichées sur le site";
  const concertList = document.createElement("ul");
  concertList.setAttribute("id", "concertList");
  listContainer.appendChild(concertListTitle);
  listContainer.appendChild(concertList);
  state.forEach((concert) => {
    concertList.appendChild(addConcert(concert));
  });
  alignList();
}

let state = [];

UI.formButton.addEventListener("click", submitConcert);

function submitConcert(e) {
  e.preventDefault();
  if (!formChecker(UI.form)) {
    UI.alertBox.innerHTML = "Formulaire incomplet.";
    displayErrorAlert();
    return;
  }
  createConcert(constructConcert())
    .then(() => {
      fetchData();
      UI.alertBox.innerHTML = "Date ajoutée avec succès.";
      displaySuccessAlert();
      resetForm(UI.form);
      console.log("Succès");
    })
    .catch((error) => {
      UI.alertBox.innerHTML = "Une erreur s'est produite.";
      displayErrorAlert();
      console.log("Erreur");
    });
}

Object.keys(UI.form).forEach((key) => {
  UI.form[key].addEventListener("change", (e) => {
    if (UI.form[key].value) {
      UI.form[key].style.border = "1px solid #50b76d";
    } else {
      UI.form[key].style.border = "1px solid #f1f1f1";
    }
  });
});

function constructConcert() {
  const dateInputValue = new Date(UI.form.dateInput.value).toLocaleDateString(
    "fr-FR"
  );
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

function addConcert(concert) {
  const concertTag = document.createElement("li");
  concertTag.classList.add("concert");
  if (concert.ticketsLink === "") {
    concertTag.innerHTML = `
      <span class="col1">${concert.date}</span>
      <span class="col2">${concert.city}</span>
      <span class="col3">${concert.depNum}</span>
      <span class="col4">${concert.place}</span>
      <span class="col5 unavailableTickets">Billetterie indisponible</span>
    `;
  } else {
    concertTag.innerHTML = `
      <span class="col1">${concert.date}</span>
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
  updateButton.classList.add("updateButton");
  updateButton.innerHTML = "Modifier";
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.innerHTML = "Supprimer";
  editButtons.appendChild(updateButton);
  editButtons.appendChild(deleteButton);
  concertTag.appendChild(editButtons);
  updateButton.addEventListener("click", () => {
    displayModal();
    Object.keys(concert).forEach((key) => {
      if (key != "_id") {
        const updateInput = document.createElement("input");
        updateInput.setAttribute("class", `${key}UpdateInput`);
        if (key === "date") {
          updateInput.addEventListener("focus", () => {
            updateInput.setAttribute("type", "date");
          });
          updateInput.addEventListener("focusout", () => {
            if (!updateInput.value) {
              updateInput.setAttribute("type", "text");
              updateInput.value = concert[key];
            }
          });
        } else {
          updateInput.setAttribute("type", "text");
          updateInput.setAttribute("class", "updateInput");
        }
        updateInput.value = concert[key];
        UI.updateForm.appendChild(updateInput);
        UI.yesButton.addEventListener("click", () => {
          if (key === "date") {
            concert[key] = new Date(updateInput.value).toLocaleDateString(
              "fr-FR"
            );
          } else {
            concert[key] = updateInput.value;
          }
          updateConcert(concert)
            .then(() => {
              hideModal();
              UI.alertBox.innerHTML = "Date modifiée avec succès.";
              displaySuccessAlert();
              fetchData();
            })
            .catch((err) => {
              UI.alertBox.innerHTML = "Une erreur s'est produite.";
              displayErrorAlert();
            });
        });
      }
    });
    UI.yesButton.innerHTML = "Modifier";
    UI.noButton.innerHTML = "Annuler";
    UI.noButton.addEventListener("click", hideModal);
    UI.modalTitle.innerHTML = "Modifier la date.";
    UI.modalAlert.appendChild(UI.modalTitle);
    UI.modalAlert.appendChild(UI.updateForm);
    UI.modalAlert.appendChild(UI.yesButton);
    UI.modalAlert.appendChild(UI.noButton);
  });
  deleteButton.addEventListener("click", () => {
    displayModal();
    UI.yesButton.innerHTML = "Oui";
    UI.noButton.innerHTML = "Non";
    UI.yesButton.addEventListener("click", () => {
      deleteConcert(concert)
        .then(() => {
          hideModal();
          UI.alertBox.innerHTML = "Date supprimée avec succès.";
          displaySuccessAlert();
          fetchData();
        })
        .catch((err) => {
          UI.alertBox.innerHTML = "Une erreur s'est produite.";
          displayErrorAlert();
        });
    });
    UI.noButton.addEventListener("click", hideModal);
    UI.modalTitle.innerHTML = "Supprimer la date.";
    UI.modalAlert.appendChild(UI.modalTitle);
    UI.modalAlert.appendChild(UI.yesButton);
    UI.modalAlert.appendChild(UI.noButton);
  });
  return concertTag;
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

function dateChecker() {
  const today = new Date();
  if (date < today) {
    UI.alertBox.innerHTML = "La date renseignée est expirée.";
    displayErrorAlert();
    return;
  }
}

function resetForm(form) {
  Object.keys(form).forEach((key) => {
    form[key].value = null;
    form[key].style.border = "1px solid #f1f1f1";
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

function displayModal() {
  UI.modalBackground.setAttribute("id", "modalBackground");
  UI.modalContainer.setAttribute("id", "modalContainer");
  UI.modalAlert.setAttribute("id", "modalAlert");
  UI.modalBackground.style.display = "block";
  UI.modalContainer.style.display = "flex";
  UI.modalContainer.appendChild(UI.modalAlert);
  UI.app.appendChild(UI.modalBackground);
  UI.app.appendChild(UI.modalContainer);
  UI.modalAlert.innerHTML = null;
}

function hideModal() {
  UI.updateForm.innerHTML = null;
  UI.modalBackground.style.display = "none";
  UI.modalContainer.style.display = "none";
}

function displaySuccessAlert() {
  UI.alertBox.classList.add("successAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

function displayErrorAlert() {
  UI.alertBox.classList.add("errorAlert");
  UI.alertBox.style.top = "0";
  setTimeout(removeAlert, 6000);
}

function removeAlert() {
  UI.alertBox.style.top = "-64px";
  UI.alertBox.innerHTML = null;
  UI.alertBox.setAttribute("class", "");
}

function createConcert(concert) {
  return fetch(`http://localhost:8070/concerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

function updateConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concert),
  });
}

function deleteConcert(concert) {
  return fetch(`http://localhost:8070/concerts/${concert._id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}
