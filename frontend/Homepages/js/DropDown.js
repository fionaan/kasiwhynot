document.addEventListener("DOMContentLoaded", function () {
    var profileBtn = document.getElementById("profileBtn");
    var dropdownMenu = document.getElementById("dropdownMenu");

    profileBtn.addEventListener("click", function () {
        dropdownMenu.classList.toggle("hidden");
    });
});
