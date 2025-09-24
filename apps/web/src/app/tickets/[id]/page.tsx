import {ticketsApi} from "@/lib/api";
import TicketActions from "./ticket-actions";

export default async function TicketDetail({params}: {params: {id: string}}) {
  const t = await ticketsApi.get(params.id);

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <div className="text-sm opacity-70">
        Priority: <b>{t.priority}</b> • Status: <b>{t.status}</b>
      </div>
      <p className="whitespace-pre-wrap">{t.description || "—"}</p>
      <div className="opacity-60 text-sm">
        Updated: {new Date(t.updatedAt).toLocaleString()}
      </div>
      {/* Client actions */}
      <TicketActions ticket={t} />
    </div>
  );
}
