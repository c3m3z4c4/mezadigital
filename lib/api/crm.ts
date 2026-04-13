import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  description: string;
  budget?: string;
  timeline?: string;
  techStack?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  concept: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  issuedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time?: string;
  topic: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── API ────────────────────────────────────────────────────────────────────

export const messagesApi = {
  list:       (token: string)                              => apiFetch<Message[]>("/api/messages", { token }),
  markRead:   (id: string, read: boolean, token: string)  => apiFetch<Message>(`/api/messages/${id}`, { method: "PUT", body: { read }, token }),
  delete:     (id: string, token: string)                  => apiFetch<void>(`/api/messages/${id}`, { method: "DELETE", token }),
  send:       (data: { name: string; email: string; phone?: string; message: string }) =>
                apiFetch<Message>("/api/messages", { method: "POST", body: data }),
};

export const quotesApi = {
  list:   (token: string)                                    => apiFetch<Quote[]>("/api/quotes", { token }),
  create: (data: Partial<Quote>, token: string)              => apiFetch<Quote>("/api/quotes", { method: "POST", body: data, token }),
  update: (id: string, data: Partial<Quote>, token: string)  => apiFetch<Quote>(`/api/quotes/${id}`, { method: "PUT", body: data, token }),
  delete: (id: string, token: string)                        => apiFetch<void>(`/api/quotes/${id}`, { method: "DELETE", token }),
};

export const invoicesApi = {
  list:   (token: string)                                      => apiFetch<Invoice[]>("/api/invoices", { token }),
  create: (data: Partial<Invoice>, token: string)              => apiFetch<Invoice>("/api/invoices", { method: "POST", body: data, token }),
  update: (id: string, data: Partial<Invoice>, token: string)  => apiFetch<Invoice>(`/api/invoices/${id}`, { method: "PUT", body: data, token }),
  delete: (id: string, token: string)                          => apiFetch<void>(`/api/invoices/${id}`, { method: "DELETE", token }),
};

export const appointmentsApi = {
  list:   (token: string)                                           => apiFetch<Appointment[]>("/api/appointments", { token }),
  create: (data: Partial<Appointment>, token: string)               => apiFetch<Appointment>("/api/appointments", { method: "POST", body: data, token }),
  update: (id: string, data: Partial<Appointment>, token: string)   => apiFetch<Appointment>(`/api/appointments/${id}`, { method: "PUT", body: data, token }),
  delete: (id: string, token: string)                               => apiFetch<void>(`/api/appointments/${id}`, { method: "DELETE", token }),
};
