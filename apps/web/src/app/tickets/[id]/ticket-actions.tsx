"use client";
import {useState} from "react";
import {ticketsApi} from "@/lib/api";
import {useRouter} from "next/navigation";
import type {Ticket, Status, Priority} from "@/types/ticket";
import Link from "next/link";

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
      setStatus(s);
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
    <div className="space-y-4">
      {/* quick status */}
      {/* <div className="join">
        <button
          onClick={() => updateStatus("OPEN")}
          className="btn btn-sm join-item"
        >
          Mark OPEN
        </button>
        <button
          onClick={() => updateStatus("IN_PROGRESS")}
          className="btn btn-sm join-item"
        >
          Mark IN_PROGRESS
        </button>
        <button
          onClick={() => updateStatus("RESOLVED")}
          className="btn btn-sm join-item"
        >
          Mark RESOLVED
        </button>
      </div> */}

      {/* form */}
      <div className="grid gap-2">
        <div className="m-2 "> Ticket Action </div>
        <input
          className="input input-bordered mx-2 border"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea textarea-bordered mx-2 border"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <select
            className="select select-bordered w-40 cursor-pointer mx-2 border"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </select>
          <select
            className="select select-bordered w-48 cursor-pointer border"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option>OPEN</option>
            <option>IN_PROGRESS</option>
            <option>RESOLVED</option>
          </select>
        </div>
      </div>

      {err && <div className="alert alert-error text-sm">{err}</div>}

      <div className="join">
        <button
          onClick={save}
          className="btn btn-primary join-item mx-2 cursor-pointer"
          disabled={busy}
        >
          Save
        </button>
        <button
          onClick={remove}
          className="btn btn-outline btn-error join-item mx-4 cursor-pointer"
          disabled={busy}
        >
          Delete
        </button>
        <Link href="/tickets" className="btn btn-primary btn-sm">Back</Link>
      </div>
    </div>
  );
}
