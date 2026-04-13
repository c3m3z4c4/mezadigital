import { create } from "zustand";
import { toast } from "sonner";
import {
  messagesApi, quotesApi, invoicesApi, appointmentsApi,
  type Message, type Quote, type Invoice, type Appointment,
} from "@/lib/api/crm";

interface CrmState {
  messages:     Message[];
  quotes:       Quote[];
  invoices:     Invoice[];
  appointments: Appointment[];
  loading:      boolean;
  saving:       boolean;

  fetchAll: (token: string) => Promise<void>;

  // Messages
  markRead:      (id: string, read: boolean, token: string) => Promise<void>;
  deleteMessage: (id: string, token: string) => Promise<void>;

  // Quotes
  saveQuote:   (data: Partial<Quote>, editingId: string | undefined, token: string) => Promise<void>;
  deleteQuote: (id: string, token: string) => Promise<void>;
  setQuoteStatus: (id: string, status: string, token: string) => Promise<void>;

  // Invoices
  saveInvoice:   (data: Partial<Invoice>, editingId: string | undefined, token: string) => Promise<void>;
  deleteInvoice: (id: string, token: string) => Promise<void>;
  setInvoiceStatus: (id: string, status: string, token: string) => Promise<void>;

  // Appointments
  saveAppointment:   (data: Partial<Appointment>, editingId: string | undefined, token: string) => Promise<void>;
  deleteAppointment: (id: string, token: string) => Promise<void>;
  setAppointmentStatus: (id: string, status: string, token: string) => Promise<void>;
}

export const useCrmStore = create<CrmState>()((set, get) => ({
  messages:     [],
  quotes:       [],
  invoices:     [],
  appointments: [],
  loading:      false,
  saving:       false,

  fetchAll: async (token) => {
    set({ loading: true });
    try {
      const [messages, quotes, invoices, appointments] = await Promise.all([
        messagesApi.list(token),
        quotesApi.list(token),
        invoicesApi.list(token),
        appointmentsApi.list(token),
      ]);
      set({ messages, quotes, invoices, appointments });
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      set({ loading: false });
    }
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  markRead: async (id, read, token) => {
    set(s => ({ messages: s.messages.map(m => m.id === id ? { ...m, read } : m) }));
    try { await messagesApi.markRead(id, read, token); }
    catch { get().fetchAll(token); toast.error("Error al actualizar"); }
  },

  deleteMessage: async (id, token) => {
    const prev = get().messages;
    set(s => ({ messages: s.messages.filter(m => m.id !== id) }));
    try { await messagesApi.delete(id, token); toast.success("Mensaje eliminado"); }
    catch { set({ messages: prev }); toast.error("Error al eliminar"); }
  },

  // ── Quotes ────────────────────────────────────────────────────────────────
  saveQuote: async (data, editingId, token) => {
    set({ saving: true });
    try {
      if (editingId) {
        const updated = await quotesApi.update(editingId, data, token);
        set(s => ({ quotes: s.quotes.map(q => q.id === editingId ? updated : q) }));
        toast.success("Propuesta actualizada");
      } else {
        const created = await quotesApi.create(data, token);
        set(s => ({ quotes: [created, ...s.quotes] }));
        toast.success("Propuesta creada");
      }
    } catch { toast.error("Error al guardar propuesta"); throw new Error("save failed"); }
    finally { set({ saving: false }); }
  },

  deleteQuote: async (id, token) => {
    const prev = get().quotes;
    set(s => ({ quotes: s.quotes.filter(q => q.id !== id) }));
    try { await quotesApi.delete(id, token); toast.success("Propuesta eliminada"); }
    catch { set({ quotes: prev }); toast.error("Error al eliminar"); }
  },

  setQuoteStatus: async (id, status, token) => {
    set(s => ({ quotes: s.quotes.map(q => q.id === id ? { ...q, status } : q) }));
    try { await quotesApi.update(id, { status }, token); }
    catch { get().fetchAll(token); toast.error("Error al actualizar"); }
  },

  // ── Invoices ──────────────────────────────────────────────────────────────
  saveInvoice: async (data, editingId, token) => {
    set({ saving: true });
    try {
      if (editingId) {
        const updated = await invoicesApi.update(editingId, data, token);
        set(s => ({ invoices: s.invoices.map(i => i.id === editingId ? updated : i) }));
        toast.success("Factura actualizada");
      } else {
        const created = await invoicesApi.create(data, token);
        set(s => ({ invoices: [created, ...s.invoices] }));
        toast.success("Factura creada");
      }
    } catch { toast.error("Error al guardar factura"); throw new Error("save failed"); }
    finally { set({ saving: false }); }
  },

  deleteInvoice: async (id, token) => {
    const prev = get().invoices;
    set(s => ({ invoices: s.invoices.filter(i => i.id !== id) }));
    try { await invoicesApi.delete(id, token); toast.success("Factura eliminada"); }
    catch { set({ invoices: prev }); toast.error("Error al eliminar"); }
  },

  setInvoiceStatus: async (id, status, token) => {
    set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status } : i) }));
    try { await invoicesApi.update(id, { status }, token); }
    catch { get().fetchAll(token); toast.error("Error al actualizar"); }
  },

  // ── Appointments ──────────────────────────────────────────────────────────
  saveAppointment: async (data, editingId, token) => {
    set({ saving: true });
    try {
      if (editingId) {
        const updated = await appointmentsApi.update(editingId, data, token);
        set(s => ({ appointments: s.appointments.map(a => a.id === editingId ? updated : a) }));
        toast.success("Reunión actualizada");
      } else {
        const created = await appointmentsApi.create(data, token);
        set(s => ({ appointments: [created, ...s.appointments] }));
        toast.success("Reunión creada");
      }
    } catch { toast.error("Error al guardar reunión"); throw new Error("save failed"); }
    finally { set({ saving: false }); }
  },

  deleteAppointment: async (id, token) => {
    const prev = get().appointments;
    set(s => ({ appointments: s.appointments.filter(a => a.id !== id) }));
    try { await appointmentsApi.delete(id, token); toast.success("Reunión eliminada"); }
    catch { set({ appointments: prev }); toast.error("Error al eliminar"); }
  },

  setAppointmentStatus: async (id, status, token) => {
    set(s => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, status } : a) }));
    try { await appointmentsApi.update(id, { status }, token); }
    catch { get().fetchAll(token); toast.error("Error al actualizar"); }
  },
}));
