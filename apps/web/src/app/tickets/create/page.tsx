"use client";
import {useState} from "react";
import {ticketsApi} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";

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
      
      <div className="card bg-base-100 border">
        <div className="card-body">
          <h1 className="card-title text-2xl font-semibold">Create Ticket</h1>

          <form onSubmit={onSubmit} className="space-y-3 mt-2">
            <div className="form-control mx-4">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                className="input input-bordered w-full border"
                placeholder="Short summary"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({...s, title: e.target.value}))
                }
              />
              <label className="label">
                <span className="label-text-alt opacity-60">≥ 5 ตัวอักษร</span>
              </label>
            </div>

            <div className="form-control mx-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full border"
                placeholder="More details… (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({...s, description: e.target.value}))
                }
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  ≤ 5000 ตัวอักษร
                </span>
              </label>
            </div>

            <div className="form-control mx-4">
              <label className="label">
                <span className="label-text ">Priority</span>
              </label>
              <select
                className="select select-bordered w-40 mx-2 border"
                value={form.priority}
                onChange={(e) =>
                  setForm((s) => ({...s, priority: e.target.value}))
                }
              >
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>

            {err && <div className="alert alert-error text-sm">{err}</div>}

            <div className="join ">
              <button
                className="btn btn-primary join-item mx-2"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
              <a href="/tickets" className="btn btn-ghost join-item mx-2">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
