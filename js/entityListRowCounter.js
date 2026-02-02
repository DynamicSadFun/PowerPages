(function (XHR, $) {
    'use strict';

    /* =========================================================
       Create / ensure counter element exists after each grid
       ========================================================= */
    $('.view-grid').each(function () {
        // Current grid element
        const $grid = $(this);

        // Check if a counter already exists right after the grid
        const $counter = $grid.next('.entity-list-count');

        // If no counter exists, create and insert one
        if (!$counter.length) {
            $('<div>', {
                class: 'entity-list-count', // CSS hook for styling
                id: 'entitylistcount'        // Used later to update text
            }).insertAfter($grid);
        }
    });

    /* =========================================================
       XMLHttpRequest interception
       Used to capture grid data responses and extract item count
       ========================================================= */

    // Preserve original XHR methods
    const _open = XHR.prototype.open;
    const _send = XHR.prototype.send;

    // Target endpoint to watch for
    const TARGET = 'entity-grid-data.json';

    // Override XHR.open to capture request URL
    XHR.prototype.open = function (method, url) {
        // Store the request URL for later inspection
        this._url = url;

        // Call the original open method
        return _open.apply(this, arguments);
    };

    // Override XHR.send to hook into the response lifecycle
    XHR.prototype.send = function () {

        // Allow opt-out of interception if needed
        if (this.noIntercept) {
            return _send.apply(this, arguments);
        }

        // Listen for state changes on the request
        this.addEventListener('readystatechange', () => {

            // Only proceed when:
            // - request is complete
            // - URL exists
            // - URL matches the target endpoint
            if (
                this.readyState !== 4 ||
                !this._url ||
                !this._url.includes(TARGET)
            ) {
                return;
            }

            let res;

            // Attempt to parse the JSON response
            try {
                res = JSON.parse(this.responseText);
            } catch (e) {
                // If response is not valid JSON, fail silently
                return;
            }

            // Determine total count:
            // Prefer Records.length, fallback to ItemCount
            const count = res.Records?.length ?? res.ItemCount;

            // If count is missing, stop
            if (count === undefined || count === null) return;

            // Find the counter element and update its text
            const el = document.getElementById('entitylistcount');
            if (el) {
                el.textContent = `Total ${count} entries`;
            }
        });

        // Execute the original send method
        return _send.apply(this, arguments);
    };

})(XMLHttpRequest, jQuery);
