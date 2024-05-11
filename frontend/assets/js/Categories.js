class SpecialHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="flex justify-between items-center px-8 pt-2"> <!-- header -->
             <h1 class="text-overlay text-3xl font-bold p-5">CEU Health</h1>
            <button href="login" class="flex items-center bg-blue-900 text-white rounded-lg py-2 px-8 m-5 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" style="height: 40px;">
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
        <footer class="bg-blue-900 text-white py-2 absolute bottom-0 w-full"> <!-- footer -->
        <h1 class="text-center text-xs">Copyright 2023 CEU Healthy</h1>
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


function applyLayout(elem) {
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

function updateTitle(data) {
    let title = document.createElement("special-title");
    title.setAttribute("title", data);
    document.getElementById("title").appendChild(title)
}

class SpecialButton extends HTMLElement {
    constructor() {
        super();
        // Define default values for icon, text, and icon size
        this.icon = "../assets/img/user.png";
        this.text = "Custom Button";
        this.iconSize = "32px";
    }

    connectedCallback() {
        this.render();
    }

    // Method to render the button
    render() {
        this.innerHTML = `
            <button class="flex flex-col justify-around items-center text-white rounded-lg p-10 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-opacity-50 special-button" style="
            width: 300px; 
            height: 300px; 
            border-radius: 15px; 
            background: linear-gradient(to bottom, var(--bg-gradient-start, #1e3a8a), var(--bg-gradient-end, #000)); 
            transition: background-color 0.5s ease;">
                <img src="${this.icon}" class="h-${this.iconSize} w-${this.iconSize} mb-2 ${this.icon === '../assets/img/user.png' ? '' : 'non-resizable-icon'}">
                <p class="text-left" style="font-size: 52px;">${this.text}</p>
            </button> 
        `;

        const button = this.querySelector('button');

        // Define CSS variables for gradient colors
        button.style.setProperty('--bg-gradient-start', '#1e3a8a');
        button.style.setProperty('--bg-gradient-end', '#000');

        // Add event listeners for hover
        button.addEventListener('mouseenter', () => {
            // Change gradient colors and transition on hover
            button.style.setProperty('--bg-gradient-start', '#000');
            button.style.setProperty('--bg-gradient-end', '#1e3a8a');
        });

        button.addEventListener('mouseleave', () => {
            // Change gradient colors and transition back on mouse leave
            button.style.setProperty('--bg-gradient-start', '#1e3a8a');
            button.style.setProperty('--bg-gradient-end', '#000');
        });
    }

    // Method to set icon attribute
    setIcon(iconSrc) {
        this.icon = iconSrc;
        this.render(); // Re-render the button with the updated icon
    }

    // Method to set icon size attribute
    setIconSize(iconSize) {
        this.iconSize = iconSize;
        this.render(); // Re-render the button with the updated icon size
    }

    // Method to set text attribute
    setText(buttonText) {
        this.text = buttonText;
        this.render(); // Re-render the button with the updated text
    }

    // Define getters and setters for icon, icon size, and text attributes
    static get observedAttributes() {
        return ['icon', 'icon-size', 'text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'icon') {
            this.icon = newValue;
            this.render();
        }
        if (name === 'icon-size') {
            this.iconSize = newValue;
            this.render();
        }
        if (name === 'text') {
            this.text = newValue;
            this.render();
        }
    }
}

customElements.define('special-button', SpecialButton);
customElements.define('special-header', SpecialHeader);
customElements.define('special-footer', SpecialFooter);
customElements.define('special-title', SpecialTitle);