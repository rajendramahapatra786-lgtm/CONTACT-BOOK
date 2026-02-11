import json
import os

FILE_NAME = "contacts.json"

# ------------------ File Handling ------------------

def load_contacts():
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as file:
            return json.load(file)
    return {}

def save_contacts(contacts):
    with open(FILE_NAME, "w") as file:
        json.dump(contacts, file, indent=4)

contacts = load_contacts()

# ------------------ Validations ------------------

def valid_phone(phone):
    return phone.isdigit() and len(phone) == 10

# ------------------ CRUD Operations ------------------

def add_contact():
    name = input("Enter name: ").strip()
    phone = input("Enter phone (10 digits): ").strip()
    email = input("Enter email: ").strip()

    if not valid_phone(phone):
        print("❌ Invalid phone number")
        return

    if phone in contacts:
        print("❌ Contact already exists")
        return

    contacts[phone] = {
        "name": name,
        "email": email
    }

    save_contacts(contacts)
    print("✅ Contact added successfully")

def view_contacts():
    if not contacts:
        print("📭 No contacts found")
        return

    print("\n📒 CONTACT LIST")
    print("-" * 30)

    for phone in contacts:   # for-loop
        print("Name :", contacts[phone]["name"])
        print("Phone:", phone)
        print("Email:", contacts[phone]["email"])
        print("-" * 30)

def search_contact():
    phone = input("Enter phone number to search: ").strip()

    if phone in contacts:
        print("✅ Contact Found")
        print("Name :", contacts[phone]["name"])
        print("Email:", contacts[phone]["email"])
    else:
        print("❌ Contact not found")

def update_contact():
    phone = input("Enter phone number to update: ").strip()

    if phone not in contacts:
        print("❌ Contact not found")
        return

    print("Leave blank to keep old value")

    name = input("New name: ").strip()
    email = input("New email: ").strip()

    if name:
        contacts[phone]["name"] = name
    if email:
        contacts[phone]["email"] = email

    save_contacts(contacts)
    print("✅ Contact updated successfully")

def delete_contact():
    phone = input("Enter phone number to delete: ").strip()

    if phone in contacts:
        del contacts[phone]
        save_contacts(contacts)
        print("🗑️ Contact deleted")
    else:
        print("❌ Contact not found")

# ------------------ Menu ------------------

def menu():
    while True:
        print("\n===== CONTACT BOOK =====")
        print("1. Add Contact")
        print("2. View Contacts")
        print("3. Search Contact")
        print("4. Update Contact")
        print("5. Delete Contact")
        print("6. Exit")

        choice = input("Choose (1-6): ").strip()

        if choice == "1":
            add_contact()
        elif choice == "2":
            view_contacts()
        elif choice == "3":
            search_contact()
        elif choice == "4":
            update_contact()
        elif choice == "5":
            delete_contact()
        elif choice == "6":
            print("👋 Exiting Contact Book")
            break
        else:
            print("⚠️ Invalid choice")

menu()
