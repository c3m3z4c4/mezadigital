import { create } from "zustand";
import { toast } from "sonner";
import {
  portfolioApi,
  type Project,
  type Service,
  type CreateProjectInput,
  type CreateServiceInput,
} from "@/lib/api/portfolio";

interface PortfolioState {
  projects: Project[];
  services: Service[];
  loading:  boolean;
  saving:   boolean;

  fetchAll: (token?: string | null) => Promise<void>;

  saveProject:         (data: Partial<CreateProjectInput>, editingId: string | undefined, token: string) => Promise<void>;
  deleteProject:       (id: string, token: string) => Promise<void>;
  toggleProjectField:  (id: string, field: "featured" | "visible", val: boolean, token: string) => Promise<void>;

  saveService:          (data: Partial<CreateServiceInput>, editingId: string | undefined, token: string) => Promise<void>;
  deleteService:        (id: string, token: string) => Promise<void>;
  toggleServiceVisible: (id: string, val: boolean, token: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  projects: [],
  services: [],
  loading:  false,
  saving:   false,

  fetchAll: async (token) => {
    set({ loading: true });
    try {
      const [projects, services] = await Promise.all([
        portfolioApi.listProjects(token),
        portfolioApi.listServices(token),
      ]);
      set({ projects, services });
    } catch {
      toast.error("No se pudo cargar el portafolio");
    } finally {
      set({ loading: false });
    }
  },

  saveProject: async (data, editingId, token) => {
    set({ saving: true });
    try {
      if (editingId) {
        const updated = await portfolioApi.updateProject(editingId, data, token);
        set((s) => ({ projects: s.projects.map((p) => (p.id === editingId ? updated : p)) }));
        toast.success("Proyecto actualizado");
      } else {
        const { projects } = get();
        const created = await portfolioApi.createProject(
          { featured: false, visible: true, techStack: [], tags: [], images: [], order: projects.length, ...data },
          token
        );
        set((s) => ({ projects: [...s.projects, created] }));
        toast.success("Proyecto creado");
      }
    } catch {
      toast.error(editingId ? "Error al actualizar" : "Error al crear");
      throw new Error("save failed");
    } finally {
      set({ saving: false });
    }
  },

  deleteProject: async (id, token) => {
    const prev = get().projects;
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    try {
      await portfolioApi.deleteProject(id, token);
      toast.success("Proyecto eliminado");
    } catch {
      set({ projects: prev });
      toast.error("Error al eliminar");
    }
  },

  toggleProjectField: async (id, field, val, token) => {
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)) }));
    try {
      await portfolioApi.updateProject(id, { [field]: val } as Partial<CreateProjectInput>, token);
    } catch {
      get().fetchAll(token);
      toast.error("Error al actualizar");
    }
  },

  saveService: async (data, editingId, token) => {
    set({ saving: true });
    try {
      if (editingId) {
        const updated = await portfolioApi.updateService(editingId, data, token);
        set((s) => ({ services: s.services.map((sv) => (sv.id === editingId ? updated : sv)) }));
        toast.success("Servicio actualizado");
      } else {
        const { services } = get();
        const created = await portfolioApi.createService(
          { visible: true, order: services.length, ...data },
          token
        );
        set((s) => ({ services: [...s.services, created] }));
        toast.success("Servicio creado");
      }
    } catch {
      toast.error(editingId ? "Error al actualizar" : "Error al crear");
      throw new Error("save failed");
    } finally {
      set({ saving: false });
    }
  },

  deleteService: async (id, token) => {
    const prev = get().services;
    set((s) => ({ services: s.services.filter((sv) => sv.id !== id) }));
    try {
      await portfolioApi.deleteService(id, token);
      toast.success("Servicio eliminado");
    } catch {
      set({ services: prev });
      toast.error("Error al eliminar");
    }
  },

  toggleServiceVisible: async (id, val, token) => {
    set((s) => ({ services: s.services.map((sv) => (sv.id === id ? { ...sv, visible: val } : sv)) }));
    try {
      await portfolioApi.updateService(id, { visible: val }, token);
    } catch {
      get().fetchAll(token);
      toast.error("Error al actualizar");
    }
  },
}));
