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
        if (!name.trim()) return alert("Name required");
        if (!Validation.phone(phone)) return alert("Invalid phone");

        if (Validation.duplicate(phone, this.contacts, this.editIndex))
            return alert("Duplicate contact");

        const contact = { name, phone, email };

        if (this.editIndex === null) {
            this.contacts.push(contact);
        } else {
            this.contacts[this.editIndex] = contact;
            this.editIndex = null;
        }

        Storage.save(this.contacts);
        UI.render(this.contacts);
        this.updateStats();
        UI.toggleForm();
    },

    edit(index) {
        const c = this.contacts[index];
        name.value = c.name;
        phone.value = c.phone;
        email.value = c.email;
        this.editIndex = index;
        UI.toggleForm();
    },

    remove(index) {
        if (!confirm("Delete this contact?")) return;
        this.contacts.splice(index, 1);
        Storage.save(this.contacts);
        UI.render(this.contacts);
        this.updateStats();
    },

    loadThemes() {
        if (localStorage.getItem("darkMode") === "on")
            document.body.classList.add("dark");

        if (localStorage.getItem("rgbMode") === "on")
            document.body.classList.add("rgb");
    }
};

/* ===== EVENTS ===== */
document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();
    App.save(name.value, phone.value, email.value);
    e.target.reset();
});

document.getElementById("search").addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    UI.render(App.contacts.filter(c =>
        c.name.toLowerCase().includes(value) || c.phone.includes(value)
    ));
});

/* ===== THEME TOGGLES ===== */
document.getElementById("darkToggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode",
        document.body.classList.contains("dark") ? "on" : "off");
};

document.getElementById("rgbToggle").onclick = () => {
    document.body.classList.toggle("rgb");
    localStorage.setItem("rgbMode",
        document.body.classList.contains("rgb") ? "on" : "off");
};

App.init();
