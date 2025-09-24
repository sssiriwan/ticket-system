import {ticketsApi} from "@/lib/api";
import TicketActions from "./ticket-actions";
import {PriorityBadge, StatusBadge} from "@/components/ticket-badges";
import type {Ticket} from "@/types/ticket";

export default async function TicketDetail({params}: {params: {id: string}}) {
  const t = (await ticketsApi.get(params.id)) as Ticket;

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      {/* <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <a href="/tickets">Tickets</a>
          </li>
          <li>{t.title}</li>
        </ul>
      </div> */}

      <div className="card bg-base-100 border">
        <div className="card-body space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <div className="flex gap-2">
              <PriorityBadge value={t.priority} />
              <StatusBadge value={t.status} />
            </div>
          </div>

          <p className="whitespace-pre-wrap">{t.description || "—"}</p>

          <div className="opacity-60 text-sm">
            Updated: {new Date(t.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Client actions */}
      <div className="card bg-base-100 border">
        <div className="card-body">
          <TicketActions ticket={t} />
        </div>
      </div>
    </div>
  );
}
