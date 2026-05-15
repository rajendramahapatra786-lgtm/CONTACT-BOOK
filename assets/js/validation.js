const Validation = {

    phone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    },

    email(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    duplicate(phone, contacts, index) {
        return contacts.some((c, i) => c.phone === phone && i !== index);
    },

    /* Allow only letters */
    cleanName(value) {
        return value.replace(/[^a-zA-Z\s]/g, "");
    },

    /* Allow only numbers */
    cleanPhone(value) {
        return value.replace(/[^0-9]/g, "");
    },

    /* Remove spaces from email */
    cleanEmail(value) {
        return value.replace(/\s/g, "");
    }
};