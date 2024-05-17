var editedValues = {}; // Object to store edited values

document.querySelectorAll('input, textarea, select').forEach(function (element) {
    element.addEventListener('input', function () {
        editedValues[this.id] = this.value;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Initial setup: Disable input, textarea, and select fields and apply uneditable styles
    document.querySelectorAll('input, textarea, select').forEach(function (element) {
        element.disabled = true;
    });

    // Remove borders and background initially
    document.querySelectorAll('.rounded-lg, .rounded-md').forEach(function (element) {
        element.classList.remove('border', 'border-gray-300', 'bg-white');
        element.classList.add('border-transparent');
    });
});

function toggleFieldStyles(field) {
    field.classList.toggle('border');
    field.classList.toggle('border-gray-300');
    field.classList.toggle('border-transparent');
    field.classList.toggle('bg-white');
}

document.getElementById('editButton').addEventListener('click', function () {
    var formElements = document.querySelectorAll('input, textarea, select');
    var isEditing = this.innerText === "Edit";

    // Toggle the enable/disable state of the input fields
    formElements.forEach(function (element) {
        element.disabled = !isEditing;
    });

    // Restore edited values back into fields if switching to edit mode
    if (isEditing) {
        formElements.forEach(function (element) {
            element.value = editedValues[element.id] || element.value;
        });
        this.innerText = "Save";
    } else {
        // Process the edited values as needed before saving (e.g., send to server)
        // For now, we'll just log the values to the console
        console.log(editedValues);

        this.innerText = "Edit";
    }

    // Toggle border and background styles based on the new state
    document.querySelectorAll('.rounded-lg, .rounded-md').forEach(function (field) {
        toggleFieldStyles(field);
    });
});
