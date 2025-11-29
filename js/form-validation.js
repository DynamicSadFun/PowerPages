$(document).ready(function() {
    /* =========================================================================
       CONFIG (Single Centralized Object)
       -------------------------------------------------------------------------
       Contains all numbers + strings used in UI feedback.
       Eliminates "magic constants" and makes future changes easier and safer.
    ========================================================================= */
    const CONFIG = {
        ERROR_BORDER_WIDTH: "2px",
        ERROR_BORDER_COLOR: "rgb(217,48,37)",
        ERROR_BACKGROUND_COLOR: "rgb(255,236,236)",
        ERROR_FONT_SIZE: "12px",
        ERROR_MARGIN_TOP: "3px",
        REQUIRED_MESSAGE: "This field is required."
    };

    /* =========================================================================
       SELECTORS
       -------------------------------------------------------------------------
       REQUIRED_SELECTOR – applies to any PP field marked required or aria-required.
       LOOKUP_SELECTOR – matches "classic" Power Pages lookup (Bootstrap version).
    ========================================================================= */
    const REQUIRED_SELECTOR =
        "input[aria-required='true'], input[required], textarea[aria-required='true'], textarea[required], select[required], select[aria-required='true']";
    const LOOKUP_SELECTOR = "input.lookup"; // Example: transactioncurrencyid_name

    /* =========================================================================
       SUPPRESS DEFAULT POWER PAGES VALIDATION SUMMARY
       -------------------------------------------------------------------------
       PP auto-generates a large validation block on failed submit.
       We hide it because we use lightweight inline validation instead.
    ========================================================================= */
    $("#ValidationSummaryEntityFormView").hide();

    /* =========================================================================
       HELPER: REMOVE ERROR STATE FROM FIELD
       -------------------------------------------------------------------------
       - Clears border and background styling
       - Removes associated inline message
       - Ensures field returns to clean UI when user corrects input
    ========================================================================= */
    function removeError($field) {
        $field.css({
            border: "",
            "background-color": ""
        });
        $field.closest(".control").find(".inline-error").remove();
    }

    /* =========================================================================
       HELPER: APPLY ERROR STATE
       -------------------------------------------------------------------------
       Applies consistent UI error styling + inline helper message.
       Ensures message is only appended once per field.
    ========================================================================= */
    function applyError($field) {
        $field.css({
            border: `${CONFIG.ERROR_BORDER_WIDTH} solid ${CONFIG.ERROR_BORDER_COLOR}`,
            "background-color": CONFIG.ERROR_BACKGROUND_COLOR
        });

        const $control = $field.closest(".control");

        // Prevent duplicate error labels under same field
        if (!$control.find(".inline-error").length) {
            $control.append(
                `<div class="inline-error"
                      style="color:${CONFIG.ERROR_BORDER_COLOR};
                             font-size:${CONFIG.ERROR_FONT_SIZE};
                             margin-top:${CONFIG.ERROR_MARGIN_TOP};">
                    ${CONFIG.REQUIRED_MESSAGE}
                 </div>`
            );
        }
    }

    /* =========================================================================
       VALIDATION ENGINE (Main)
       -------------------------------------------------------------------------
       Validates:
         - Inputs (text, number, etc.)
         - Textareas
         - Select elements
         - Checkboxes
         - Classic Power Pages lookups (input.lookup)
       
       Returns:
         true  = all fields valid
         false = at least one field invalid
    ========================================================================= */
    function validateRequired() {
        let valid = true;

        /* ---------------------------------------------------------------------
           1) STANDARD REQUIRED FIELDS
           ---------------------------------------------------------------------
           All inputs/selects/textareas marked required via standard HTML
           or Power Pages' aria-required attributes.
        --------------------------------------------------------------------- */
        $(REQUIRED_SELECTOR).each(function() {
            const $field = $(this);
            const type = $field.attr("type");

            // Checkbox → must be checked
            if (type === "checkbox") {
                if (!$field.is(":checked")) {
                    applyError($field);
                    valid = false;
                }
                return;
            }

            // All other form fields → require trimmed non-empty value
            const value = $field.val();
            if (!value || !value.trim()) {
                applyError($field);
                valid = false;
            }
        });

        /* ---------------------------------------------------------------------
           2) CLASSIC POWER PAGES LOOKUP VALIDATION
           ---------------------------------------------------------------------
           Example lookup structure:
           - Visible text input:   transactioncurrencyid_name (class="lookup")
           - Hidden underlying ID: transactioncurrencyid        (GUID)

           Validation rules:
           - Visible text box must contain a value
           - Hidden GUID must be present (ensures real record chosen)
        --------------------------------------------------------------------- */
        $(LOOKUP_SELECTOR).each(function() {

            const $lookupText = $(this);

            // Lookup field is required only if PP marks it required
            if (
                !$lookupText.attr("required") &&
                $lookupText.attr("aria-required") !== "true"
            ) return;

            const textVal = $lookupText.val()?.trim();

            // Hidden ID input (same ID minus "_name")
            const baseFieldId = $lookupText.attr("id")?.replace("_name", "");
            const $hiddenIdField = $("#" + baseFieldId);
            const hiddenVal = $hiddenIdField.val()?.trim();

            // If visible text or hidden GUID missing → not valid
            if (!textVal || !hiddenVal) {
                applyError($lookupText);
                valid = false;
            }
        });

        return valid;
    }

    /* =========================================================================
       LIVE ERROR CLEAN-UP (FIXED FOR LOOKUPS)
       -------------------------------------------------------------------------
       Classic Power Pages lookups:
    	 - Visible textbox: fieldname_name (class="lookup")
    	 - Hidden GUID input: fieldname
       When user selects a lookup value → hidden field receives GUID
       → We must remove error when hidden field changes.
    ======================================================================== */
    $(document).on("input change", "input, select, textarea", function() {
        const $field = $(this);
        const type = $field.attr("type");

        // 1) Checkbox cleanup
        if (type === "checkbox") {
            if ($field.is(":checked")) removeError($field);
            return;
        }

        // 2) Classic lookup textbox cleanup
        if ($field.hasClass("lookup")) {
            // Case 1: user typed something
            if ($field.val()?.trim()) {
                removeError($field);
            }

            // Case 2: hidden GUID updated (lookup value selected)
            const hiddenId = $field.attr("id")?.replace("_name", "");
            const $hiddenField = $("#" + hiddenId);

            if ($hiddenField.length > 0) {
                if ($hiddenField.val()?.trim()) {
                    removeError($field);
                }
            }
            return;
        }

        // 3) Hidden lookup ID cleanup (record selected)
        if ($field.attr("type") === "hidden" && $field.attr("id")) {
            const id = $field.attr("id");
            const $lookupText = $("#" + id + "_name");

            if ($lookupText.length && $field.val()?.trim()) {
                removeError($lookupText);
            }
            return;
        }

        // 4) Standard input/select cleanup
        if ($field.val() && $field.val().trim() !== "") {
            removeError($field);
        }
    });

    /* =========================================================================
       SUBMIT HANDLER
       -------------------------------------------------------------------------
       - Re-hides OOB Power Pages validation block (it may reappear)
       - Runs the full validation engine
       - Prevents form submission on validation failure
    ========================================================================= */
    $("#NextButton").on("click", function(e) {
        // PP regenerates this element sometimes → always hide before validation
        $("#ValidationSummaryEntityFormView").hide();

        if (!validateRequired()) {
            e.preventDefault();
            return false;
        }
    });
});
