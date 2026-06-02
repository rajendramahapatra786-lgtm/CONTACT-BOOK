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

    UI.render(
        App.contacts.filter(c =>
            c.name.toLowerCase().includes(value) ||
            c.phone.includes(value)
        )
    );
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

/* ===== START APP ===== */
App.init();