import type {Ticket, TicketListResponse} from "@/type/ticket";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    next: {revalidate: 0},
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = (data as any)?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const ticketsApi = {
  list: (q: {
    status?: string;
    priority?: string;
    search?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const sp = new URLSearchParams(q as Record<string, string>);
    return request<TicketListResponse>(`/tickets?${sp.toString()}`);
  },
  create: (body: {title: string; description?: string; priority: string}) =>
    request<Ticket>("/tickets", {method: "POST", body: JSON.stringify(body)}),
  get: (id: string) => request<Ticket>(`/tickets/${id}`),
  update: (
    id: string,
    body: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
    }>
  ) =>
    request<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ok: true}>(`/tickets/${id}`, {method: "DELETE"}),
};
