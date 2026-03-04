const CAPTCHA_INPUT = $(".RadCaptcha").find("input[type='text'][maxlength='7']");
const CAPTCHA_INPUT_ID = CAPTCHA_INPUT.length > 0 ? "#" + CAPTCHA_INPUT.attr("id") : null;

const NUMBERS = {
    directExportMin: 0,
    directExportMax: 100,
    integerMinDefault: 0,
    integerMaxDefault: 2147483647,
    moneyMinDefault: -922337203685477,
    moneyMaxDefault: 922337203685477,
    captchaMaxLength: 7
};

const VALIDATION_MESSAGES = {
  required: "This field is required.",
  captchaRequired: "Please enter the CAPTCHA code.",
  emailInvalid: "Please enter a valid email address.",
  integerInvalid: "Must be a valid integer.",
  numberInvalid: "Must be a valid number.",
  directExportRange: "Value must be between 0 and 100.",
  captchaTooLong: "CAPTCHA code is too long."
};

const REQUIRED_SELECTOR =
    "input[aria-required='true']:not([type='hidden']),"
    + "input[required]:not([type='hidden']),"
    + "textarea[aria-required='true'], textarea[required],"
    + "select[required], select[aria-required='true'],"
    + CAPTCHA_INPUT_ID;

const LOOKUP_SELECTOR = "input.lookup";
const VALIDATION_SUMMARY_SELECTOR = "#ValidationSummaryEntityFormView";
const VALIDATION_SUMMARY_SELECTOR_MODAL = "#ValidationSummaryEntityFormControl_EntityFormView";

function removeError(field) {
    const $field = field instanceof jQuery ? field : $(field);

    const $target = $field.is("input[id$='_PCF']")
        ? $field.parent()
        : $field;

    $target[0].style.setProperty("border", "", "important");

    if ($field.is(CAPTCHA_INPUT_ID)) {
        const container = $field.parent();
        container.find(".inline-error").remove();
        return;
    }

    let control = $field.closest(".control");
    if (control.length > 0) {
        control.find(".inline-error").remove();
        if (control.children().length === 0) {
            control.remove();
        }
    }
}

function applyError(field, message = VALIDATION_MESSAGES.required) {
    const $field = field instanceof jQuery ? field : $(field);

    const $target = $field.is("input[id$='_PCF']")
        ? $field.parent()
        : $field;

    $target[0].style.setProperty(
        "border",
        "2px solid rgb(255,15,0)",
        "important"
    );

    if ($field.is(CAPTCHA_INPUT_ID)) {
        const container = $field.parent();
        container.find(".inline-error").remove();
        container.prepend(
            `<div class="inline-error" style="color:#d93025;font-size:12px;margin-bottom:3px;">${message}</div>`
        );
        return;
    }

    let control = $field.closest(".control");
    if (control.length === 0) {
        control = $("<div class='control'></div>").insertBefore($field);
    }
    if (control.find(".inline-error").length === 0) {
        control.append(
            `<div class="inline-error" style="color:#d93025;font-size:12px;margin-top:3px;">${message}</div>`
        );
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidInteger(value) {
    return /^-?\d+$/.test(value);
}

function isValidNumber(value) {
    return value.trim() !== "" && !isNaN(value);
}

function FormValidation() {
    let valid = true;
    let firstErrorField = null;

    $(VALIDATION_SUMMARY_SELECTOR)?.remove();
    $(VALIDATION_SUMMARY_SELECTOR_MODAL)?.remove();

    $(REQUIRED_SELECTOR).each(function () {
        let field = $(this);

        if (!field.is(":visible")) return;
        if (field.attr("type") === "hidden") return;

        const isPCFField = field.attr("id") && field.attr("id").includes("_PCF");
        const pcfBaseFieldId = isPCFField ? field.attr("id").replace("_PCF", "") : "";

        let value = field.val()?.trim();
        let name = (field.attr("name") || "").toLowerCase();

        function flagError(message) {
            applyError(field, message);
            if (!firstErrorField) firstErrorField = field;
            valid = false;
        }

        if (isPCFField) {
            const hiddenFieldValue = $("#" + pcfBaseFieldId).val()?.trim();
            
            if (!hiddenFieldValue || hiddenFieldValue === '""') {
                flagError(VALIDATION_MESSAGES.required);
            } else {
                removeError(field);
            }
            return;
        }

        if (!value) {
            if (field.is(CAPTCHA_INPUT_ID)) {
                flagError(VALIDATION_MESSAGES.captchaRequired);
            } else {
                flagError(VALIDATION_MESSAGES.required);
            }
            return;
        } else {
            removeError(field);
        }

        if (field.attr("type") === "email" && !isValidEmail(value)) {
            flagError(VALIDATION_MESSAGES.emailInvalid);
        }

        if (field.hasClass("integer")) {
            if (!isValidInteger(value)) {
                flagError(VALIDATION_MESSAGES.integerInvalid);
            } else {
                let min = parseInt(field.attr("min"), 10) || NUMBERS.integerMinDefault;
                let max = parseInt(field.attr("max"), 10) || NUMBERS.integerMaxDefault;
                let num = parseInt(value, 10);
                if (num < min || num > max) {
                    flagError(`Value must be between ${min} and ${max}.`);
                }
            }
        }

        if (field.hasClass("money")) {
            if (!isValidNumber(value)) {
                flagError(VALIDATION_MESSAGES.numberInvalid);
            } else {
                let min = parseFloat(field.attr("min")) || NUMBERS.moneyMinDefault;
                let max = parseFloat(field.attr("max")) || NUMBERS.moneyMaxDefault;
                let num = parseFloat(value);
                if (num < min || num > max) {
                    flagError(`Value must be between ${min} and ${max}.`);
                }
            }
        }

        if (field.is(CAPTCHA_INPUT_ID)) {
            if (value.length > NUMBERS.captchaMaxLength) {
                flagError(VALIDATION_MESSAGES.captchaTooLong);
            }
        }
    });

    $("input[type='checkbox'][aria-required='true']").each(function () {
        let checkbox = $(this);

        if (!checkbox.is(":visible")) return;

        if (!checkbox.is(":checked")) {
            applyError(checkbox);
            if (!firstErrorField) firstErrorField = checkbox;
            valid = false;
        } else {
            removeError(checkbox);
        }
    });

    $(LOOKUP_SELECTOR).each(function () {
        const $lookupText = $(this);

        if (!$lookupText.is(":visible")) return;
        if ($lookupText.is("select")) return;

        if (
            !$lookupText.attr("required") &&
            $lookupText.attr("aria-required") !== "true"
        ) return;

        const textVal = $lookupText.val()?.trim();
        const baseFieldId = $lookupText.attr("id")?.replace("_name", "");
        const $hiddenIdField = $("#" + baseFieldId);
        const hiddenVal = $hiddenIdField.val()?.trim();

        if (!textVal || !hiddenVal) {
            applyError($lookupText);
            if (!firstErrorField) firstErrorField = $lookupText;
            valid = false;
        } else {
            removeError($lookupText);
        }
    });

    if (!valid && firstErrorField) {
        setTimeout(() => firstErrorField.focus(), 50);
    }

    return valid;
}

// in your form, use it as:
// formHandler.setupSubmitButtonClickHandler("YOUR_SUBMIT_BUTTON_ID");
const formHandler = {
    setupSubmitButtonClickHandler: function (buttonId) {
        const submitButton = document.getElementById(buttonId);

        if (!submitButton) {
            console.warn(`Submit button with id '${buttonId}' not found.`);
            return;
        }

        const originalOnClick = submitButton.onclick;

        $(".entity-form").on("input change", "input, select, textarea", function () {
            const field = $(this);
            if (
                (field.attr("type") === "checkbox" && field.is(":checked")) ||
                (field.val() && field.val().trim() !== "")
            ) {
                removeError(field);
            }
        });

        submitButton.onclick = function (event) {
            event.preventDefault();
            const isValid = FormValidation();
            if (isValid) {
                if (originalOnClick) {
                    originalOnClick.apply(submitButton, [event]);
                }
            } else {
                console.log("Validation failed. Form will not be submitted.");
                return false;
            }
        };
    }
};
