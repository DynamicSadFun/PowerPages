$(document).ready(() => {
    // Find all input and textarea elements
    // that contain a maxlength attribute
    $("input[maxlength], textarea[maxlength]").each(function () {
        // Current field reference
        const $field = $(this);
        // Prevent duplicate counter creation
        // if script runs more than once
        if ($field.next(".char-counter").length) {
            return;
        }
        // Read maxlength value dynamically
        const maxLength = Number($field.attr("maxlength"));
        // Get field ID
        const fieldId = $field.attr("id");
        // Create counter element
        const $counter = $(`
            <small 
                class="char-counter"
                id="${fieldId}-counter"
                style="display:block; margin-top:5px; color:#666;"
            >
                0/${maxLength}
            </small>
        `);
        // Insert counter below the field
        $field.after($counter);
        // Function to update current character count
        const updateCounter = () => {
            // Get current text length
            const currentLength = $field.val().length;
            // Update counter text
            $counter.text(`${currentLength}/${maxLength}`);
            // Change style when approaching limit
            $counter.css({
                color: currentLength >= maxLength - 10 ? "red" : "#666",
                fontWeight: currentLength >= maxLength - 10 ? "600" : "normal"
            });
        };
        // Update counter while typing
        $field.on("input", updateCounter);
        // Initialize counter on page load
        updateCounter();
    });
});
