import type {Ticket, TicketList} from "@/types/ticket";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // ให้เป็น SSR สด ๆ
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const ticketsApi = {
  list: (q: Record<string, string>) =>
    http<TicketList>(`/tickets?` + new URLSearchParams(q).toString()),
  get: (id: string) => http<Ticket>(`/tickets/${id}`),
  create: (dto: {title: string; description?: string; priority: string}) =>
    http<Ticket>(`/tickets`, {method: "POST", body: JSON.stringify(dto)}),
  update: (id: string, dto: Partial<Ticket>) =>
    http<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    http<{ok: true}>(`/tickets/${id}`, {method: "DELETE"}),
};
