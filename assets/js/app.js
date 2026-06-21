/* ===== INPUT REFERENCES ===== */
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const profileImageInput = document.getElementById("profileImage");
// const category = document.getElementById("category").value;


const App = {
    contacts: Storage.get(),
    editIndex: null,

    init() {

        this.contacts.sort(
            (a, b) => b.favorite - a.favorite
        );

        UI.render(this.contacts);

        this.updateStats();

        this.loadThemes();
    },

    updateStats() {
        document.getElementById("totalCount").innerText = this.contacts.length;
    },

    save(name, phone, email, category) {
        if (!name.trim()) {
            UI.notify("Name is required ❌", "error");
            return;
        }

        if (!Validation.phone(phone)) {
            UI.notify(
                "Enter a valid Indian mobile number (starts with 6–9) ❌",
                "error"
            );
            return;
        }

        /* Email validation */
        if (!Validation.email(email)) {
            UI.notify("Enter a valid email address ❌", "error");
            return;
        }

        if (Validation.duplicate(phone, this.contacts, this.editIndex)) {
            UI.notify("Duplicate contact ❌", "error");
            return;
        }

        const contact = {
            name,
            phone,
            email,
            category,

            favorite:
                this.editIndex !== null
                    ? this.contacts[this.editIndex].favorite
                    : false,

            image: imageData || (
                this.editIndex !== null
                    ? this.contacts[this.editIndex].image
                    : null
            )
        };

        const isEdit = this.editIndex !== null;

        if (isEdit) {
            this.contacts[this.editIndex] = contact;
            this.editIndex = null;
        } else {
            this.contacts.push(contact);
        }

        this.contacts.sort(
            (a, b) => b.favorite - a.favorite
        );

        Storage.save(this.contacts);
        imageData = null;
        profileImageInput.value = "";
        UI.render(this.contacts);
        this.updateStats();
        UI.toggleForm();

        UI.notify(
            isEdit
                ? "Contact updated successfully ✏️"
                : "Contact added successfully ✅"
        );
    },

    edit(index) {
        const c = this.contacts[index];
        nameInput.value = c.name;
        phoneInput.value = c.phone;
        emailInput.value = c.email;
        this.editIndex = index;
        UI.toggleForm();
    },

    remove(index) {
        if (!confirm("Delete this contact?")) return;

        this.contacts.splice(index, 1);
        Storage.save(this.contacts);
        UI.render(this.contacts);
        this.updateStats();

        UI.notify("Contact deleted 🗑️", "error");
    },

    toggleFavorite(index) {

        this.contacts[index].favorite =
            !this.contacts[index].favorite;

        this.contacts.sort(
            (a, b) => b.favorite - a.favorite
        );

        Storage.save(this.contacts);

        UI.render(this.contacts);

        this.updateStats();
    },

    loadThemes() {
        if (localStorage.getItem("darkMode") === "on") {
            document.body.classList.add("dark");
        }

        if (localStorage.getItem("rgbMode") === "on") {
            document.body.classList.add("rgb");
        }
    }
};

let imageData = null;
profileImageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        imageData = e.target.result;
    };

    reader.readAsDataURL(file);

});


/* ===== FORM SUBMIT ===== */
document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();

    App.save(
        nameInput.value,
        phoneInput.value,
        emailInput.value,
        document.getElementById("category").value

    );

    e.target.reset();
});

/* ===== SEARCH ===== */
document.getElementById("search").addEventListener("input", e => {

    const value = e.target.value.toLowerCase();

    const filtered = App.contacts.filter(c =>
        c.name.toLowerCase().includes(value) ||
        c.phone.includes(value) ||
        c.email.toLowerCase().includes(value) ||
        c.category.toLowerCase().includes(value)
    );

    UI.render(filtered, value);
});

/* ===== CATEGORY FILTER ===== */

document.getElementById("filterCategory")
    .addEventListener("change", e => {

        const category = e.target.value;

        if (!category) {
            UI.render(App.contacts);
            return;
        }

        const filtered = App.contacts.filter(c =>
            c.category === category
        );

        UI.render(filtered);
    });


/* ===== VOICE SEARCH ===== */

document.getElementById("voiceSearch")
    .addEventListener("click", () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            UI.notify("Voice search not supported ❌", "error");
            console.log("SpeechRecognition not available");
            return;
        }

        const micBtn = document.getElementById("voiceSearch");
        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.interimResults = false;


        micBtn.disabled = true;

        recognition.start();

        UI.notify("Listening... 🎤");

        recognition.onstart = function () {
            console.log("Mic started");
        };

        recognition.onresult = function (event) {

            let text = event.results[0][0].transcript.toLowerCase();

            text = text.replace(/[.,!?]/g, "").trim();

            if (!text) {
                micBtn.disabled = false;
                UI.notify("No voice detected 🎤", "error");
                return;
            }

            console.log("You said:", text);

            document.getElementById("search").value = text;

            const filtered = App.contacts.filter(c =>
                c.name.toLowerCase().includes(text) ||
                c.phone.includes(text) ||
                c.email.toLowerCase().includes(text) ||
                c.category.toLowerCase().includes(text)
            );

            UI.render(filtered, text);

            UI.notify("Voice Search Success ✅");
        };

        recognition.onerror = function (event) {

            console.log("Speech error:", event.error);

            micBtn.disabled = false;

            UI.notify("Mic error: " + event.error, "error");
        };

        recognition.onend = function () {
            console.log("Mic ended");

            micBtn.disabled = false;
        };
    });

/* ===== INPUT RESTRICTIONS ===== */

/* Clean invalid pasted values */
nameInput.addEventListener("input", () => {
    nameInput.value = Validation.cleanName(nameInput.value);
});

phoneInput.addEventListener("input", () => {
    phoneInput.value = Validation.cleanPhone(phoneInput.value);
});

emailInput.addEventListener("input", () => {
    emailInput.value = Validation.cleanEmail(emailInput.value);
});

/* Block invalid typing */

/* Name: allow only letters and spaces */
nameInput.addEventListener("keypress", e => {
    const char = String.fromCharCode(e.which);

    if (!/[a-zA-Z\s]/.test(char)) {
        e.preventDefault();
    }
});

/* Phone: allow only numbers */
phoneInput.addEventListener("keypress", e => {
    const char = String.fromCharCode(e.which);

    if (!/[0-9]/.test(char)) {
        e.preventDefault();
    }
});

/* ===== THEME TOGGLES ===== */
document.getElementById("darkToggle").onclick = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark") ? "on" : "off"
    );
};

document.getElementById("rgbToggle").onclick = () => {
    document.body.classList.toggle("rgb");

    localStorage.setItem(
        "rgbMode",
        document.body.classList.contains("rgb") ? "on" : "off"
    );
};


/* ===== KEYBOARD SHORTCUTS ===== */

document.addEventListener("keydown", (e) => {

    /* ============================
    Alt + N → Open Form 
    =================================*/


    if (e.altKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        const form = document.getElementById("formSection");

        if (!form.classList.contains("active")) {

            UI.toggleForm();

            nameInput.focus();

            UI.notify("Add Contact Form Opened ⌨️");
        }
    }

    /*======================
     ESC → Close Form 
     ========================*/

    if (e.key === "Escape") {

        const form = document.getElementById("formSection");

        if (form.classList.contains("active")) {

            App.editIndex = null;

            document.getElementById("contactForm").reset();

            profileImageInput.value = "";

            UI.toggleForm();

            UI.notify("Form Closed ⌨️");
        }
    }

    /*==================================
     Ctrl + F → Focus Search 
     ===================================*/

    if (e.ctrlKey && e.key.toLowerCase() === "f") {

        e.preventDefault();

        document.getElementById("search").focus();

        UI.notify("Search Activated 🔍");
    }
});



/* ===== START APP ===== */
App.init();