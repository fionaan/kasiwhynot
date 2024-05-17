class SpecialHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="flex justify-between px-8 pt-2"> <!-- header -->
             <h1 class="text-overlay text-3xl font-bold p-5">CEU Health</h1>
            <button href="login" class="flex items-center bg-blue-950 text-white rounded-lg py-2 px-8 m-5 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
             <img src="../assets/img/user.png" class="h-4 w-4 mr-2 filter invert">
            <p class="text-center">Profile</p>
            </button> 
            </header>
        `
    }
}

class SpecialButton extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div
        class="bg-gradient-to-b from-blue-900 to-black px-10 py-20 rounded-lg shadow-md flex flex-col items-center button-container">
        <a href="./Categories.html" class="hover:text-gray-400 text-xl font-semibold flex flex-col items-center">
          <img src="./Icons/add-medical-records-icon.png" alt="Medical.png" class="mb-2">
          <span class="button-text">Add Medical Records</span>
        </a>
      </div>
    `
    }
}

class SpecialFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-blue-950 text-white py-2 px-8 absolute bottom-0 w-full"> <!-- footer -->
             <div class="container mx-auto">
             <p class="text-center text-xs">Copyright 2023 CEU Healthy</p>
               </div>
             </footer>
        `
    }
}

class SpecialTitle extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="flex px-8 align-middle"> <!-- title -->
            <button class="mx-5 mr-4 pl-3 relative w-12 h-12">
                <img src="../assets/img/realBack.png" class="w-6 h-6">
                <span class="absolute inset-0 flex items-center justify-center rounded-full bg-transparent hover:bg-black hover:bg-opacity-25 transition-all">
                </span>
            </button>
            <h1 class="px-4 pt-1 text-3xl align-middle">View Patient List</h1>
            </div>
        `
    }
}


customElements.define('special-header', SpecialHeader)
customElements.define('special-footer', SpecialFooter)
customElements.define('special-title', SpecialTitle)
customElements.define('special-button', SpecialButton)