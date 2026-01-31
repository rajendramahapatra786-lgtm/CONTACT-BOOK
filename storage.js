const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("contacts")) || [];
    },
    save(data) {
        localStorage.setItem("contacts", JSON.stringify(data));
    }
};
