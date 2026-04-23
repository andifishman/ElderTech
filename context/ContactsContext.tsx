import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatar?: string;
}

interface ContactsContextType {
  contacts: Contact[];
  addContact: (c: Omit<Contact, 'id'>) => void;
  editContact: (id: string, c: Omit<Contact, 'id'>) => void;
  deleteContact: (id: string) => void;
}

const ContactsContext = createContext<ContactsContextType | null>(null);

const initialContacts: Contact[] = [
  { id: '1', name: 'María (Hija)', phone: '+54 11 4567-7890', relation: 'Hija' },
  { id: '2', name: 'Carlos (Hijo)', phone: '+54 11 8690-5432', relation: 'Hijo' },
  { id: '3', name: 'Ana (Nieta)', phone: '+54 11 2345-1789', relation: 'Nieta' },
];

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const addContact = (c: Omit<Contact, 'id'>) => {
    setContacts((prev) => [...prev, { ...c, id: Date.now().toString() }]);
  };

  const editContact = (id: string, c: Omit<Contact, 'id'>) => {
    setContacts((prev) => prev.map((x) => (x.id === id ? { ...c, id } : x)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact, editContact, deleteContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error('useContacts must be used within ContactsProvider');
  return ctx;
}
