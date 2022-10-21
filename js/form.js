export function resetForm(form) {
  Object.keys(form).forEach((key) => {
    form[key].value = null;
    form[key].style.border = "1px solid #f1f1f1";
  });
}

export function resetUpdateForm(form) {
  Object.keys(form).forEach((key) => {
    form[key].style.border = "1px solid #161616";
  });
}

export function formChecker(form) {
  let valid = true;
  Object.keys(form).forEach((key) => {
    if (form[key].required && !form[key].value) {
      form[key].style.border = "1px solid #e56c6c";
      valid = false;
    }
  });
  return valid;
}

export function dateChecker(date) {
  let valid = true;
  const today = new Date().getTime();
  const concertDate = new Date(date).getTime();
  if (concertDate < today) {
    valid = false;
  }
  return valid;
}
