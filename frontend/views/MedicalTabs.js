document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            loadTabContent(tab);
            setActiveTab(button);
        });
    });

    // Load initial tab content
    loadTabContent('personal');
});

function loadTabContent(tab) {
    let url;
    if (tab === 'personal') {
        url = 'BasicInfoContainer.html';
    } else if (tab === 'laboratory') {
        url = 'laboratoryContainer.html';
    }
    else if (tab === 'vaccination') {
        url = 'vaccinationContainer.html';
    }else if (tab === 'medicalHistory') {
        url = 'medicalHistoryContainer.html';
    }
    else if (tab === 'done') {
        url = 'medicalHistoryContainer.html';
    }
    

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            document.getElementById('container').innerHTML = xhr.responseText;
        } else {
            document.getElementById('container').innerHTML = `<p class="text-red-500">Error loading content: ${xhr.statusText}</p>`;
        }
    };
    xhr.onerror = function () {
        document.getElementById('container').innerHTML = `<p class="text-red-500">Error loading content: ${xhr.statusText}</p>`;
    };
    xhr.send();
}

function setActiveTab(activeButton) {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.setAttribute('aria-selected', 'false');
        button.classList.remove('hs-tab-active:font-semibold', 'hs-tab-active:border-blue-600', 'hs-tab-active:text-blue-600');
    });
    activeButton.setAttribute('aria-selected', 'true');
    activeButton.classList.add('hs-tab-active:font-semibold', 'hs-tab-active:border-blue-600', 'hs-tab-active:text-blue-600');
}

//For Progress Bar (test)
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-button');
    const progressIndicator = document.getElementById('progressIndicator');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const selectedTab = this.getAttribute('data-tab');
            activateTab(selectedTab);
            updateProgress(selectedTab);
        });
    });

    function activateTab(selectedTab) {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === selectedTab) {
                tab.classList.add('font-semibold', 'text-blue-600');
            } else {
                tab.classList.remove('font-semibold', 'text-blue-600');
            }
        });
    }

    function updateProgress(selectedTab) {
        const tabWidth = 100 / (tabs.length - 1); // Calculate width percentage per tab
        const selectedIndex = Array.from(tabs).findIndex(tab => tab.getAttribute('data-tab') === selectedTab);
        const progressWidth = tabWidth * selectedIndex;

        progressIndicator.style.width = `${progressWidth}%`;

        // Check if the progress is incomplete (not on the last tab)
        if (selectedIndex < tabs.length - 1) {
            progressIndicator.classList.remove('bg-green-500');
            progressIndicator.classList.add('bg-blue-900');
        } else {
            progressIndicator.classList.remove('bg-blue-900');
            progressIndicator.classList.add('bg-green-500');
        }
    }

    // Initialize with the first tab (Personal Information) activated
    const initialTab = 'personal';
    activateTab(initialTab);
    updateProgress(initialTab);
});
