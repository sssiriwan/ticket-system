"use client";
import {useState} from "react";
import {ticketsApi} from "@/lib/api";
import {useRouter} from "next/navigation";
import type {Ticket, Status, Priority} from "@/type/ticket";

export default function TicketActions({ticket}: {ticket: Ticket}) {
  const router = useRouter();
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description || "");
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [status, setStatus] = useState<Status>(ticket.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    setBusy(true);
    try {
      await ticketsApi.update(ticket.id, {
        title,
        description,
        priority,
        status,
      });
      router.refresh();
    } catch (e: any) {
      setErr(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(s: Status) {
    setErr(null);
    setBusy(true);
    try {
      await ticketsApi.update(ticket.id, {status: s});
      router.refresh();
    } catch (e: any) {
      setErr(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this ticket?")) return;
    setErr(null);
    setBusy(true);
    try {
      await ticketsApi.remove(ticket.id);
      router.push("/tickets");
    } catch (e: any) {
      setErr(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => updateStatus("OPEN")} className="btn btn-sm">
          Mark OPEN
        </button>
        <button
          onClick={() => updateStatus("IN_PROGRESS")}
          className="btn btn-sm"
        >
          Mark IN_PROGRESS
        </button>
        <button onClick={() => updateStatus("RESOLVED")} className="btn btn-sm">
          Mark RESOLVED
        </button>
      </div>

      <div className="grid gap-2">
        <input
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea textarea-bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="flex gap-2">
        <button onClick={save} className="btn btn-primary" disabled={busy}>
          Save
        </button>
        <button
          onClick={remove}
          className="btn btn-outline btn-error"
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
