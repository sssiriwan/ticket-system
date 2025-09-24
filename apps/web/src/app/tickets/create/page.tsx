"use client";
import {useState} from "react";
import {ticketsApi} from "@/lib/api";
import {useRouter} from "next/navigation";

export default function CreateTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.title.trim().length < 5) {
      setErr("Title ต้องยาวอย่างน้อย 5 ตัวอักษร");
      return;
    }
    try {
      setSubmitting(true);
      const t = await ticketsApi.create(form);
      router.push(`/tickets/${t.id}`);
    } catch (e: any) {
      setErr(e.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Create Ticket</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input input-bordered w-full"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((s) => ({...s, title: e.target.value}))}
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm((s) => ({...s, description: e.target.value}))
          }
        />
        <select
          className="select select-bordered"
          value={form.priority}
          onChange={(e) => setForm((s) => ({...s, priority: e.target.value}))}
        >
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
