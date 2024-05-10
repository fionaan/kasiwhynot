class SpecialHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="flex justify-between items-center px-8 pt-2"> <!-- header -->
             <h1 class="text-overlay text-3xl font-bold p-5">CEU Health</h1>
            <button href="login" class="flex items-center bg-blue-950 text-white rounded-lg py-2 px-8 m-5 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" style="height: 40px;">
             <img src="../assets/img/user.png" class="h-4 w-4 mr-2 filter invert">
            <p class="text-center">Profile</p>
            </button> 
            </header>
        `
    }
}

class SpecialFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="bg-blue-950 text-white py-2 w-full"> <!-- footer -->
        <div class=" ">
        <h1 class="text-center text-xs">Copyright 2023 CEU Healthy</h1>
          </div>
        </footer>
        `
    }
}

class SpecialTitle extends HTMLElement {

    static get observedAttributes() {
        return ["title"];
      }

      constructor() {
        // Always call super first in constructor

        super()


      }

      connectedCallback() {
        console.log("Custom square element added to page.");
        applyLayout(this);
      }
    
      disconnectedCallback() {
        console.log("Custom square element removed from page.");
      }
    
      adoptedCallback() {
        console.log("Custom square element moved to new page.");
      }
    
      attributeChangedCallback(name, oldValue, newValue) {
        console.log("Custom square element attributes changed.");
        applyLayout(this);
      }
        
}


function applyLayout(elem){
    elem.innerHTML = `
            <div class="flex px-8 align-middle"> <!-- title -->
            <button class="mx-5 mr-4 pl-3 relative w-12 h-12">
                <img src="../assets/img/realBack.png" class="w-6 h-6">
                <span class="absolute inset-0 flex items-center justify-center rounded-full bg-transparent hover:bg-black hover:bg-opacity-25 transition-all">
                </span>
            </button>
            <h1 class="px-4 pt-1 text-3xl align-middle"> ${elem.getAttribute("title")}</h1>
            </div>
        `
    }

    function updateTitle(data){
      let title = document.createElement("special-title");
      title.setAttribute("title", data);
      document.getElementById("title").appendChild(title)
    }


customElements.define('special-header', SpecialHeader)
customElements.define('special-footer', SpecialFooter)
customElements.define('special-title', SpecialTitle)