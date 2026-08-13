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

        applyFiltersAndSort();

        this.updateStats();

        this.loadThemes();
    },

    updateStats() {
        document.getElementById("totalCount").innerText = this.contacts.length;
    },


    save(name, phone, email, category) {

        category = category || "Other";

        if (!name.trim()) {
            UI.notify("Name is required ❌", "error");
            nameInput.focus();
            return false;
        }

        if (!Validation.phone(phone)) {

            UI.notify(
                "Enter a valid Indian mobile number (starts with 6–9) ❌",
                "error"
            );

            phoneInput.focus();

            return false;
        }

        /* Email validation */
        if (!Validation.email(email)) {

            UI.notify("Enter a valid email address ❌", "error");

            emailInput.focus();

            return false;
        }

        if (Validation.duplicate(phone, this.contacts, this.editIndex)) {

            UI.notify("Duplicate contact ❌", "error");

            phoneInput.focus();

            return false;
        }

        const contact = {
            name,
            phone,
            email,
            category,

            createdAt:
                this.editIndex !== null
                    ? this.contacts[this.editIndex].createdAt
                    : Date.now(),

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
        applyFiltersAndSort();
        this.updateStats();
        UI.toggleForm();

        UI.notify(
            isEdit
                ? "Contact updated successfully ✏️"
                : "Contact added successfully ✅"
        );
        return true;
    },

    edit(index) {
        const c = this.contacts[index];
        nameInput.value = c.name;
        phoneInput.value = c.phone;
        emailInput.value = c.email;
        document.getElementById("category").value = c.category;
        this.editIndex = index;
        UI.toggleForm();
    },

    remove(index) {
        if (!confirm("Delete this contact?")) return;

        this.contacts.splice(index, 1);
        Storage.save(this.contacts);
        applyFiltersAndSort();
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

        applyFiltersAndSort();

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

    const saved = App.save(
        nameInput.value.trim(),
        phoneInput.value.trim(),
        emailInput.value.trim(),
        document.getElementById("category").value || "Other"
    );

    if(saved) {

        e.target.reset();

        document.getElementById("category").value = "Other";

        profileImageInput.value = "";

        imageData = null;

    }

});

// /* ===== SEARCH ===== */
function applyFiltersAndSort() {

    let filtered = [...App.contacts];

    // Search
    const searchValue =
        document.getElementById("search")
            .value.toLowerCase();

    if (searchValue) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchValue) ||
            c.phone.includes(searchValue) ||
            c.email.toLowerCase().includes(searchValue) ||
            c.category.toLowerCase().includes(searchValue)
        );
    }

    // Category
    const category =
        document.getElementById("filterCategory").value;

    if (category) {
        filtered = filtered.filter(c =>
            c.category === category
        );
    }

    // Sort
    const sortType =
        document.getElementById("sortContacts").value;

    switch (sortType) {

        case "az":
            filtered.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "za":
            filtered.sort((a, b) =>
                b.name.localeCompare(a.name)
            );
            break;

        case "newest":
            filtered.sort((a, b) =>
                b.createdAt - a.createdAt
            );
            break;

        case "oldest":
            filtered.sort((a, b) =>
                a.createdAt - b.createdAt
            );
            break;
    }

    UI.render(filtered);
}

document.getElementById("search")
    .addEventListener("input",
        applyFiltersAndSort);

document.getElementById("filterCategory")
    .addEventListener("change",
        applyFiltersAndSort);

document.getElementById("sortContacts")
    .addEventListener("change",
        applyFiltersAndSort);

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

    // Limit to 10 digits
    phoneInput.value = phoneInput.value.slice(0, 10);

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