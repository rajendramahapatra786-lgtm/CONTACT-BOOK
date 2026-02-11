const Validation = {
    phone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    },

    duplicate(phone, contacts, index) {
        return contacts.some((c, i) => c.phone === phone && i !== index);
    }
};
