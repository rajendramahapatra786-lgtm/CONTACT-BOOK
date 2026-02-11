/* ===== INPUT REFERENCES ===== */
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

const App = {
    contacts: Storage.get(),
    editIndex: null,

    init() {
        UI.render(this.contacts);
        this.updateStats();
        this.loadThemes();
    },

    updateStats() {
        document.getElementById("totalCount").innerText = this.contacts.length;
    },

    save(name, phone, email) {
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

        if (Validation.duplicate(phone, this.contacts, this.editIndex)) {
            UI.notify("Duplicate contact ❌", "error");
            return;
        }

        const contact = { name, phone, email };

        const isEdit = this.editIndex !== null;

        if (isEdit) {
            this.contacts[this.editIndex] = contact;
            this.editIndex = null;
        } else {
            this.contacts.push(contact);
        }

        Storage.save(this.contacts);
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

    loadThemes() {
        if (localStorage.getItem("darkMode") === "on") {
            document.body.classList.add("dark");
        }

        if (localStorage.getItem("rgbMode") === "on") {
            document.body.classList.add("rgb");
        }
    }
};

/* ===== FORM SUBMIT ===== */
document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();

    App.save(
        nameInput.value,
        phoneInput.value,
        emailInput.value
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
