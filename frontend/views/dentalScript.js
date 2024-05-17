// dental form

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
    loadTabContent('dental');
});

function loadTabContent(tab) {
    let url;
    if (tab === 'dental') {
        url = 'dentalContainer.html';
    } else if (tab === 'done') {
        url = 'dentalContainer.html';
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            document.getElementById('trial').innerHTML = xhr.responseText;
        } else {
            document.getElementById('trial').innerHTML = `<p class="text-red-500">Error loading content: ${xhr.statusText}</p>`;
        }
    };
    xhr.onerror = function () {
        document.getElementById('trial').innerHTML = `<p class="text-red-500">Error loading content: ${xhr.statusText}</p>`;
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

// // Progress Bar

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

        if (selectedIndex < tabs.length - 1) {
            progressIndicator.classList.remove('bg-green-500');
            progressIndicator.classList.add('bg-red-500');
        } else {
            progressIndicator.classList.remove('bg-red-500');
            progressIndicator.classList.add('bg-green-500');
        }
    }
});


//modals

function cancelMessageBox(){
    let cancelMessage = document.getElementById('cancelMessage')
    cancelMessage.classList.remove('hidden')
    cancelMessage.classList.add('flex')
    setTimeout(()=>{
        cancelMessage.classList.add('opacity-100')
    },20)
}
function hideCancelMessage(){
    let cancelMessage = document.getElementById('cancelMessage')
    cancelMessage.classList.add('opacity-0')
    cancelMessage.classList.remove('opacity-100')
    setTimeout(()=>{
        cancelMessage.classList.add('hidden')
        cancelMessage.classList.remove("flex")
    },500)
}

function saveMessageBox(){
    let saveMessage = document.getElementById('saveMessage')
    saveMessage.classList.remove('hidden')
    saveMessage.classList.add('flex')
    setTimeout(()=>{
        saveMessage.classList.add('opacity-100')
    },20)
}
function hideSaveMessage(){
    let saveMessage = document.getElementById('saveMessage')
    saveMessage.classList.add('opacity-0')
    saveMessage.classList.remove('opacity-100')
    setTimeout(()=>{
        saveMessage.classList.add('hidden')
        saveMessage.classList.remove("flex")
    },500)
}

function showResetMessage(){
    let resetMessage = document.getElementById('resetMessage')
    resetMessage.classList.remove('hidden')
    resetMessage.classList.add('flex')
    setTimeout(()=>{
        resetMessage.classList.add('opacity-100')
    },20)
}

function hideResetMessage(){
    let resetMessage = document.getElementById('resetMessage')
    resetMessage.classList.add('opacity-0')
    resetMessage.classList.remove('opacity-100')
    setTimeout(()=>{
        resetMessage.classList.add('hidden')
        resetMessage.classList.remove("flex")
    },500)
}

document.getElementById('doneTab').addEventListener('click', function() {
    document.getElementById('dentalTab').ariaSelected = 'false'
    document.getElementById('doneTab').ariaSelected = 'true'
    checkScroll()
});

//Check If nasa Done tab and nasa end ng form na (needs to improve pa - Prototype)

document.getElementById('trial').addEventListener('scroll', checkScroll)

function checkScroll() {
    const trialDiv = document.getElementById('trial')
    const bottomRightButtons = document.getElementById('bottomRightButtons')
    if (document.getElementById('doneTab').ariaSelected === 'true' && trialDiv.scrollTop + trialDiv.clientHeight >= trialDiv.scrollHeight) {
        bottomRightButtons.style.display = 'flex'
    } else {
        bottomRightButtons.style.display = 'none'
    }
}