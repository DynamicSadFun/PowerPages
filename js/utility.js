const STATUS_CONFIG = [
    {
        entity: "mserp_vrmrequestforquotationreplyheaderentity",
        field: "mserp_replyprogressstatus",
        classes: {
            200000000: "status-blue",     // Not started
            200000001: "status-orange",   // Vendor is updating
            200000002: "status-orange",   // Purchaser is updating
            200000003: "status-gray",     // Submitted by vendor
            200000004: "status-gray",     // Submitted by purchaser
            200000005: "status-red",      // Declined by vendor
            200000006: "status-red",      // Declined by purchaser
            200000007: "status-yellow"    // Returned to vendor
        }
    },
    {
        entity: "mserp_vrmpurchaseorderconfirmationheaderentity",
        field: "mserp_purchaseorderstatus",
        classes: {
            200000000: "status-gray",    // None
            200000001: "status-blue",    // Open order
            200000002: "status-green",   // Received
            200000003: "status-blue",    // Invoiced
            200000004: "status-red"      // Cancelled
        }
    },
    {
        entity: "mserp_vrmpurchaseorderresponseheaderentity",
        field: "mserp_responsestate",
        classes: {
            200000000: "status-orange",  // Unanswered
            200000001: "status-gray",    // Accepted
            200000002: "status-gray",    // Rejected
            200000003: "status-orange",  // Edited
            200000004: "status-gray",    // Accepted with changes
            200000005: "status-orange"   // NoResponse
        }
    }
];

function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

function getOptionSetValue($cell) {
    try {
        const data = JSON.parse($cell.attr("data-value"));
        return data?.Value ?? null;
    } catch {
        return null;
    }
}

window.addEventListener("load", function () {
    console.log('CONTENT_LOADED');
    const fluentProgress = `<fluent-progress-ring></fluent-progress-ring>`;

    document.querySelectorAll('.form-loading').forEach(element => {
        element.innerHTML = `${fluentProgress}
    <span class="saving-loading-label">Loading form...</span>`;
    });

    document.querySelectorAll('.view-loading').forEach(element => {
        element.innerHTML = `
    <div class="loading-wrapper">
        ${fluentProgress}
        <span class="saving-loading-label">Loading...</span>
    </div>`;
    });

    const infoIcon = iconList.find(_icon => _icon.id === 'banner-info');
    document.querySelectorAll('.validation-header .fa').forEach(icon => {
        icon.classList.toggle('fa-info-circle');
        icon.innerHTML = infoIcon.svg;
    });

    document.querySelectorAll('.input-group-text').forEach(element => {
        if (element.textContent.includes('$')) {
            element.style.display = 'none';
        }
    });

    const observer = new MutationObserver(() => {
        const element = document.querySelector('.msdyn-custom-dialog-form');
        if (element) {
            console.log('The .msdyn-custom-dialog-form element is now present in the DOM.');
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function ObserveOnloadingForm(callback) {
    const targetElement = document.querySelector(".form-loading");

    if (targetElement) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "attributes" && mutation.attributeName === "style") {
                    callback(true)
                }
            });
        });

        observer.observe(targetElement, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }
}

function IframeInjector(className = "msdyn-custom-dialog-form") {
    const setClasses = ["certificates", className, "form-overlay"];

    function handleIframeLoad(event) {
        try {
            const iframe = event.target;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            if (!iframeDoc) {
                console.warn("Iframe content document not accessible.");
                return;
            }

            console.info("Iframe loaded!");
            const targetDiv = iframeDoc.getElementById("EntityFormControl");
            if (iframeDoc?.body) {
                iframeDoc.body.style.background = "#fff";
            }

            if (targetDiv) {
                targetDiv.classList.add(...setClasses);
                setTimeout(() => {
                    const modal = document.querySelector('.modal-dialog');
                    const modalBody = modal.querySelector('.modal-body');
                    modalBody.classList.add('hide-overlay');
                }, 800)
            } else {
                console.warn("Target div #EntityFormControl not found.");
            }
        } catch (error) {
            console.warn(`Can't access iframes due to cross-origin restrictions.`);
        }
    }

    let interval = null;
    const observer = new MutationObserver(() => {
        checkIframe();
    });

    function checkIframe() {
        const modal = document.querySelector("section.modal.show");
        if (!modal) {
            clearInterval(interval);
            observer.disconnect();
            return;
        }
        const iframe = modal.querySelector("iframe");

        const url = new URL(iframe.src);
        const contactId = url.searchParams.get("id");
        const entityFormId = url.searchParams.get("entityformid");

        if (entityFormId === "a82a5478-a225-f011-8c4e-000d3a36a8b3") {
            iframe.src = "/edit-portal-user?id=" + contactId;
        }

        if (iframe && !iframe.dataset.injected) {
            iframe.dataset.injected = "true";
            iframe.addEventListener("load", handleIframeLoad);
        }
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    let retryCount = 10;
    interval = setInterval(() => {
        checkIframe();
        if (--retryCount === 0) {
            clearInterval(interval);
            observer.disconnect();
            console.log("Stopped iframe checking after multiple attempts.");
        }
    }, 500);
}

function ObserveNotificationAlert(closestTableName = '') {
    const observer = new MutationObserver(() => {
        const element = document.querySelector(".notifications");
        if (element && element.offsetParent !== null) {

            const successHtml = $('.notifications').html();

            $(".subgrid-cell").each(function () {
                if ($(this).find(".notification").length > 0) {
                    $(this).find(".notification").remove();
                }
            });

            if (closestTableName) {
                $(`table[data-name='${closestTableName}']`).each(function () {
                    $(this).find(".subgrid-cell").prepend(successHtml);
                });
                setTimeout(() => {
                    $('.notification .alert-success').css('display', 'block');
                }, 900);
            } else {
                $('.subgrid-cell').prepend(successHtml);
                $('.alert-success > #MessageLabel').each(function () {
                    const message = $(this).text();
                    if (message) {
                        $('.notification .alert-success').css('display', 'block');
                    }
                });
            }
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

const fetchAPIUpdateUI = async (url, prefix) => {
    try {
        const res = await fetch(url);
        const text = await res.text();

        let data;

        try {
            const start = text.indexOf("{");
            const end = text.lastIndexOf("}");

            if (start === -1 || end === -1 || end <= start) {
                throw new Error("No JSON object found in response");
            }

            const jsonText = text.slice(start, end + 1);
            data = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error(`[API Parse Error from ${url}]:`, parseErr, "Raw response:", text);
            document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
                el.textContent = "X";
                el.classList.remove("loading");
            });
            return;
        }

        if (data.error) {
            console.error(`[API Error from ${url}]:`, data.error);
            document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
                el.textContent = "?";
                el.classList.remove("loading");
            });
            return;
        }

        Object.entries(data).forEach(([key, value]) => {
            if (!key.startsWith(prefix)) return;
            const el = document.getElementById(key);
            if (el) {
                el.textContent = value;
                el.classList.remove("loading");
            }
        });
    } catch (err) {
        console.error(`Failed to fetch from ${url}:`, err);
        document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
            el.textContent = "X";
            el.classList.remove("loading");
        });
    }
}

function renderStatusBadges($entityList) {
    $entityList.find("tbody td").each(function () {

        const $cell = $(this);
        const $row = $cell.closest("tr");

        const entity = $row.data("entity");
        const field = $cell.data("attribute");

        const config = STATUS_CONFIG.find(item =>
            item.entity === entity &&
            item.field === field
        );

        if (!config) {
            return;
        }

        const optionValue = getOptionSetValue($cell);

        if (optionValue === null) {
            return;
        }

        const cssClass = config.classes[optionValue];

        if (!cssClass) {
            return;
        }

        const label = $cell.text().trim();
        $cell.html(
            `<span class="badges ${cssClass}">${escapeHtml(label)}</span>`
        );

    });
}

function maskSensitiveData(elements = [], visibleLastParts = 4, format = 'x') {
    const selector = {
        arraySet: (selector) => {
            return Array.from(new Set(selector || []));
        },
        joinSelectors: (qrySelectors = []) => {
            const selectors = qrySelectors.length ? qrySelectors.join(',') : null;
            return document.querySelectorAll(selectors);
        },
        _isInput: (el) => {
            return (el?.tagName || '').toLowerCase() === 'input';
        },
        _readString: (el) => {
            if (!el) return '';
            return selector._isInput(el)
                ? (el.value ?? '').toString().trim()
                : (el.textContent ?? '').toString().trim();
        },
        _writeToNode: (el, value) => {
            if (!el) return;
            if (selector._isInput(el)) {
                el.value = value ?? '';
            } else {
                el.textContent = value ?? '';
            }
        },
        maskedValue: (account, visible = 4, maskedType = 'x') => {
            const lastValue = account.slice(-visible);
            const masked = account.slice(0, -visible).replace(/./g, maskedType);
            return masked + lastValue;
        }
    }

    const $elements = selector.arraySet(elements);
    const nodeList = selector.joinSelectors($elements);
    nodeList.forEach((_el) => {
        const value = selector._readString(_el);
        const maskedValue = selector.maskedValue(value, visibleLastParts, format);
        selector._writeToNode(_el, maskedValue);
    })
}

function userHasRoles(rolesToCheck = []) {
    const el = document.querySelector('.user-webrole');
    const userRoles = el?.dataset?.userRoles || '';
    return rolesToCheck.some(role => userRoles.includes(role));
}

function applyGenericModalFormStyles() {
    document.body.style.backgroundColor = 'white';
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
    const el = document.getElementById("content-container");
    el?.classList.replace("container", "container-fluid");
    document.querySelectorAll('.table-info > .field-label').forEach(el => {
        Object.assign(el.style, {
            fontWeight: '600',
            color: '#242424fa',
            fontSize: '15px',
            marginBottom: '.4rem'
        });
    });
    moveSubmit();
}

const msdynModal = (() => {
    let modalCounter = 0;
    const msdyn = window.msdyn ??= {};
    const okBtnLabel = msdyn?.Portal?.Snippets?.modal.okBtnLabel || 'Ok';
    const cancelBtnText = msdyn?.Portal?.Snippets?.modal.closeBtnLabel || 'Close';
    const timesIcon = msdyn?.Portal?.Snippets?.modal.timesIcon || 'x';
    const themeBrandFontFamily = 'font-family:Segoe UI;';
    const showModal = (options = {}) => {
        const {
            title = "",
            message = "",
            confirmText = okBtnLabel,
            customClass = "",
            cancelText = cancelBtnText,
            showCancel = true,
            size = "", // "modal-sm", "modal-lg", "modal-xl"
            backdrop = true, // true | false | "static"
            keyboard = true,
            onConfirm = null,
            onCancel = null
        } = options;
        modalCounter += 1;

        const modalId = `dynamicModal_${modalCounter}`;
        const modalHtml = `
        <div style="${themeBrandFontFamily}" class="modal fade ${customClass}" id="${modalId}" tabindex="-1" aria-hidden="true"
            data-bs-backdrop="${backdrop}" 
            data-bs-keyboard="${keyboard}">
            <div class="modal-dialog ${size}">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" title="${cancelText}" aria-label="${cancelText}">
                        <span aria-hidden="true">${timesIcon}</span>
                        <span class="visually-hidden">Close</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer">
                    <fluent-button appearance="accent" id="dynamic-modal-confirm-btn" data-role="confirm" type="button">${confirmText}</fluent-button>
                        ${showCancel ? `<fluent-button id="dynamic-modal-close-btn" data-bs-dismiss="modal" data-role="cancel" type="button" >${cancelText} </fluent-button>` : ""}
                </div>
            </div>
        </div>`;

        //Inject into DOM
        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById(modalId);
        const confirmBtn = modalEl.querySelector('#dynamic-modal-confirm-btn');
        const cancelBtn = modalEl.querySelector('#dynamic-modal-close-btn');
        const modal = new bootstrap.Modal(modalEl, {
            backdrop,
            keyboard
        });

        confirmBtn.addEventListener("click", () => {
            onConfirm && onConfirm(modal);
        });

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                onCancel && onCancel();
            });
        }

        modalEl.addEventListener("hidden.bs.modal", () => {
            modal.dispose();
            modalEl.remove();
        });

        modal.show();
        return modal;
    }

    return {
        show: showModal
    };
})();

function moveSubmit() {
    const $actions = $(".actions");
    if ($actions.length) {
        $actions.css({
            "display": "flex",
            "justify-content": "flex-end"
        });
    }

    const $btn = $("#UpdateButton");
    const $rightCol = $(".form-action-container-right");
    if ($btn.length && $rightCol.length) {
        $rightCol
            .css("display", "flex")
            .css("justify-content", "flex-end")
            .append($btn);
    }
}

function adjustWindowSize(modalHeight, modalWidth, calculable = false) {
    if (!window.parent || !window.parent.document) return;

    const parentDoc = window.parent.document;
    const $modal = $(parentDoc).find(".modal.show");
    const $modalDialog = $modal.find(".modal-dialog");

    if (!$modal.length || !$modalDialog.length) return;

    const $modalContent = $modal.find(".modal-content");
    const $iframe = $modal.find("iframe");

    let finalHeight = modalHeight;

    if (calculable) {
        const visibleRows = $("tr:visible").length;
        const ROW_HEIGHT = 85;
        const HEADER_HEIGHT = $modal.find(".modal-header").outerHeight() || 70;
        const PADDING = 10;

        const calculatedHeight =
            (visibleRows * ROW_HEIGHT) +
            HEADER_HEIGHT +
            PADDING;

        finalHeight = Math.max(modalHeight, calculatedHeight);
    }

    if (modalWidth) {
        $modalDialog.css({
            "max-width": modalWidth + "px",
            "width": modalWidth + "px"
        });
    }

    if (finalHeight) {
        $modalContent.css({
            "height": finalHeight + "px"
        });
    }

    if ($iframe.length) {
        $iframe.css({
            "height": "100%",
            "width": "100%",
            "border": "0"
        });
    }
}

function addButtonIcon() {
    const plusIcon = iconList.find(_icon => _icon.id === 'plus-icon');
    if (plusIcon?.svg) {
        $(".create-action").each(function () {
            const currentButtonText = $(this).text();
            $(this).html(`<span class="icon-msdyn-plus-icon">${plusIcon.svg}</span><span class="txt-regular-action">${currentButtonText}</span>`);
        });
    }
}

function hideEntityColumn({ columnAttribute = 'Legal entity', toggle = 'hide' }) {
    const COLUMN_NAME = columnAttribute;

    const normalize = (value = '') =>
        String(value).toLowerCase().replace(/[\s_]/g, '').trim();

    const keywords = [COLUMN_NAME, 'legal entity'].map(normalize);

    const isMatch = (value = '') => {
        const normalizedValue = normalize(value);
        return keywords.some(keyword => normalizedValue.includes(keyword));
    };

    $('table').each((_, table) => {
        const $table = $(table);

        $table.find('thead th').each((_, th) => {
            const $th = $(th);
            if (isMatch($th.text())) {
                $th[toggle]();
            }
        });

        $table.find('tbody tr').each((_, tr) => {
            $(tr).find('td').each((_, td) => {
                const $td = $(td);
                if (isMatch($td.attr('data-th'))) {
                    $td[toggle]();
                }
            });
        });
    });
}

function onLegalEntitySearchToggle() {
    const select = document.querySelectorAll('.entitylist-filter-option-text select');
    if (!select.length) {
        return;
    }
    const values = Array.from(select).map(option => String(option.value || '').trim());
    const allEmpty = values.every(_val => _val === '');
    const toggle = allEmpty ? 'show' : 'hide';

    hideEntityColumn({
        columnAttribute: 'Legal entity',
        toggle
    });
}

// Hide/show the LegalEntityId and Company Code column when any workspace entity grid is loaded.
$(function () {
    const $entityGrid = $(".entity-grid.entitylist");
    if (!$entityGrid.length) return;
    $entityGrid.on("loaded", () => {
        onLegalEntitySearchToggle();
        renderStatusBadges($(this));
    });
});

function enforceNumericInput(selector) {
    const $input = $(selector);

    $input.on("keypress", function (e) {
        const char = String.fromCharCode(e.which);

        if (e.which === 0 || e.which === 8) return;

        if (!/^[0-9]$/.test(char)) {
            e.preventDefault();
        }
    });

    $input.on("input", function () {
        let cleaned = $(this).val().replace(/\D/g, '');
        if ($(this).val() !== cleaned) {
            $(this).val(cleaned);
        }
    });
}
window.enforceNumericInput = enforceNumericInput;

function applyReadOnlyMode() {
    $("table").each(function () {
        const $table = $(this);
        const $headers = $table.find("thead th");

        if (!$headers.length) return;

        const $lastTh = $headers.last();

        const isActionsColumn =
            ($lastTh.attr("aria-label") || "").toLowerCase().includes("action") ||
            ($lastTh.text() || "").toLowerCase().includes("action") ||
            $lastTh.find(".sr-only").text().toLowerCase().includes("action");

        if (!isActionsColumn) return;

        $lastTh.remove();

        $table.find("tbody tr").each(function () {
            $(this).find("td").last().remove();
        });
    });

    $("input, textarea, select")
        .prop("disabled", true)
        .addClass("readonly-field");

    $("button, input[type='submit']").hide();

    $("a, .btn").each(function () {
        const txt = ($(this).text() || "").toLowerCase();
        if (txt.includes("edit") || txt.includes("save") || txt.includes("submit")) {
            $(this).remove();
        }
    });

    $(".input-group-btn, .dropdown-toggle, .select2-arrow, .create-action").remove();

    $(".fa-pencil, .fa-edit, .fa-ellipsis-h")
        .closest("a, button")
        .remove();

    $(".readonly-field").css({
        border: "none",
        pointerEvents: "none",
        boxShadow: "none"
    });

    $("<style>")
        .prop("type", "text/css")
        .html(`
            .control select.readonly-field {
                border: 0 !important;
                box-shadow: none !important;
            }
            .vendor-information-section .control .input-group:not(.float-start) {
                border: 0 !important;
                box-shadow: none !important;
            }
            .control > select:not(.picklist).readonly-field {
                background: none !important;
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                padding-right: 0 !important;
            }
            .input-group-text { 
                background-color: #e9ecef;
                border: 0px;
            }
            .form-select:disabled {
                color:#242424fa!important;
            }
            .global-vendor-form fieldset .control .input-group:not(.float-start) {
                justify-content: unset !important;
                border: none !important;
                border-radius: 0 !important;
                width: auto !important;
            }
        `)
        .appendTo("head");
}
window.applyReadOnlyMode = applyReadOnlyMode;