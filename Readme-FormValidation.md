## 📌 `form-validation.js` — Client-Side Form Validation for Power Pages

<img width="867" height="725" alt="form-required-0" src="https://github.com/user-attachments/assets/16665661-a515-4d80-a6e0-d494e98ea4b6" />

This script provides a robust client-side validation layer for Power Pages basic or multistep forms. It **enhances the default portal form behavior** by checking required fields, numbers, emails, lookups, checkboxes, and CAPTCHA inputs before submit.

> 💡 Power Pages allows adding custom JavaScript to forms, which runs on the client side to improve interactivity and UX.([Microsoft Learn][1])

---

## 🧱 What It Validates

### ✅ Required Fields

* Text inputs, textareas, selects flagged with `required` or `aria-required="true"`
* CAPTCHA inputs detected via `.RadCaptcha`
* Only visible and non-hidden fields are validated

If missing, the field is highlighted and flagged with a message.

---

### ✅ Email Format

Uses a regex pattern to check if the value looks like a valid email:

```js
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

Invalid email triggers an error message.

---

### ✅ Number & Integer Checks

Fields marked with `.integer` or `.money` classes are checked for correct format and range:

* **Integer**: whole number only
* **Money**: decimal number allowed

If out of range or invalid, error messages are shown.

---

### ✅ Lookup Fields

Text inputs representing lookup values (Power Pages lookup controls) must have both:

* a non-empty visible text
* a corresponding hidden field value

Missing either causes validation to fail.

---

### ✅ Required Checkboxes

Checkboxes with `aria-required="true"` must be checked — otherwise they’re marked as invalid.

---

## 🎨 Error Display & UX

The script:

* Adds a **red border** around invalid fields
* Inserts inline error messages
* Removes errors dynamically when the user interacts with the field

The first invalid field is auto-focused to help users fix issues quickly.

---

## 🧠 How to Use

You can attach validation to the form’s submit button like this:

```js
formHandler.setupSubmitButtonClickHandler(
  FormValidation,
  [".entity-form"],
  "YOUR_SUBMIT_BUTTON_ID"
);
```

The handler intercepts the click, runs validation, and only allows submission if all checks pass.

---

## 📋 Internals Overview

| Feature               | Description                                  |
| --------------------- | -------------------------------------------- |
| `CAPTCHA_INPUT`       | Detects CAPTCHA textbox on the page          |
| `NUMBERS`             | Stores default numeric limits                |
| `VALIDATION_MESSAGES` | Centralized text for errors                  |
| `applyError()`        | Adds error UI                                |
| `removeError()`       | Clears error UI                              |
| `FormValidation()`    | Main validation function                     |
| `formHandler`         | Helper to bind validation to a submit button |

---

## 🧠 Summary

This script improves out-of-the-box form behavior in Power Pages by providing:

✔ Client-side validation for many common scenarios

✔ Consistent UI feedback for users

✔ A reusable pattern for any Power Pages form

It significantly enhances basic portal forms with modern UX validation without relying on server calls.


[1]: https://learn.microsoft.com/en-us/power-pages/configure/add-custom-javascript?utm_source=chatgpt.com "Add custom JavaScript to a form | Microsoft Learn"
