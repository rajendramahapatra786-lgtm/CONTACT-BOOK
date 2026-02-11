const UI = {
    list: document.getElementById("contactList"),
    form: document.getElementById("formSection"),

    render(contacts) {
        this.list.innerHTML = "";

        if (contacts.length === 0) {
            this.list.innerHTML = `
                <div class="empty-state">
                    <h3>No contacts yet</h3>
                    <p>Click + to add your first contact</p>
                </div>
            `;
            return;
        }

        contacts.forEach((c, i) => {
            this.list.innerHTML += `
                <div class="card">
                    <div>
                        <strong>${c.name}</strong>
                        <p>${c.phone}</p>
                        <small>${c.email}</small>
                    </div>
                    <div class="actions">
                        <button onclick="App.edit(${i})">✏️</button>
                        <button onclick="App.remove(${i})">🗑️</button>
                    </div>
                </div>
            `;
        });
    },

    toggleForm() {
        this.form.classList.toggle("active");
    },

    /* 🔔 TOAST NOTIFICATION */
    notify(message, type = "success") {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = `show ${type}`;

        setTimeout(() => {
            toast.className = "";
        }, 2500);
    }
};
