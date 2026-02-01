const Validation = {
    phone(phone) {
        return /^\d{10}$/.test(phone);
    },

    duplicate(phone, contacts, index) {
        return contacts.some((c, i) => c.phone === phone && i !== index);
    }
};
