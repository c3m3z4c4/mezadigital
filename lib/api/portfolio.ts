import { apiFetch } from "./client";

export interface Project {
  id: string;
  title_en: string;
  title_es: string;
  description_en?: string;
  description_es?: string;
  images: string[];
  projectType?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  client?: string;
  year?: number;
  featured: boolean;
  visible: boolean;
  order: number;
  tags: string[];
  createdAt?: string;
}

export interface Service {
  id: string;
  title_en: string;
  title_es: string;
  description_en?: string;
  description_es?: string;
  icon?: string;
  image?: string;
  visible: boolean;
  order: number;
  createdAt?: string;
}

export type CreateProjectInput = Omit<Project, "id" | "createdAt">;
export type CreateServiceInput = Omit<Service, "id" | "createdAt">;

export const portfolioApi = {
  listProjects: (token?: string | null) =>
    apiFetch<Project[]>("/api/projects", { token }),

  createProject: (data: Partial<CreateProjectInput>, token: string) =>
    apiFetch<Project>("/api/projects", { method: "POST", body: data, token }),

  updateProject: (id: string, data: Partial<CreateProjectInput>, token: string) =>
    apiFetch<Project>(`/api/projects/${id}`, { method: "PUT", body: data, token }),

  deleteProject: (id: string, token: string) =>
    apiFetch<void>(`/api/projects/${id}`, { method: "DELETE", token }),

  listServices: (token?: string | null) =>
    apiFetch<Service[]>("/api/services", { token }),

  createService: (data: Partial<CreateServiceInput>, token: string) =>
    apiFetch<Service>("/api/services", { method: "POST", body: data, token }),

  updateService: (id: string, data: Partial<CreateServiceInput>, token: string) =>
    apiFetch<Service>(`/api/services/${id}`, { method: "PUT", body: data, token }),

  deleteService: (id: string, token: string) =>
    apiFetch<void>(`/api/services/${id}`, { method: "DELETE", token }),

  uploadFile: async (file: File, token: string): Promise<{ path: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
