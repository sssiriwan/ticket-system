import Link from "next/link";
import { ticketsApi } from "@/lib/api";
import { Suspense } from "react";
import { PriorityBadge, StatusBadge } from "@/components/ticket-badges";
import type { TicketList } from "@/types/ticket";

// ----------------- Toolbar-----------------
function Toolbar({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const status = (searchParams.status as string) || "";
  const priority = (searchParams.priority as string) || "";
  const search = (searchParams.search as string) || "";
  const sortBy = (searchParams.sortBy as string) || "createdAt";
  const sortOrder = (searchParams.sortOrder as string) || "desc";

  // สวยขึ้นด้วย card และ spacing
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <form className="flex flex-wrap items-end gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text mx-2">Search</span></label>
            <input
              name="search"
              placeholder="title/description..."
              defaultValue={search}
              className="input input-bordered w-64"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Status</span></label>
            <select name="status" defaultValue={status} className="select select-bordered w-40 cursor-pointer mx-2">
              <option value="">All</option>
              <option>OPEN</option>
              <option>IN_PROGRESS</option>
              <option>RESOLVED</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Priority</span></label>
            <select name="priority" defaultValue={priority} className="select select-bordered w-40 cursor-pointer mx-2">
              <option value="">All</option>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Sort by</span></label>
            <select name="sortBy" defaultValue={sortBy} className="select select-bordered w-40 cursor-pointer mx-2">
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Order</span></label>
            <select name="sortOrder" defaultValue={sortOrder} className="select select-bordered w-32 cursor-pointer mx-2">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="join ml-auto">
            <button className="btn btn-primary join-item cursor-pointer" type="submit">Search</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- List -----------------
async function List({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Number((searchParams.page as string) || "1");
  const pageSize = Number((searchParams.pageSize as string) || "10");

  const data = (await ticketsApi.list({
    status: (searchParams.status as string) || "",
    priority: (searchParams.priority as string) || "",
    search: (searchParams.search as string) || "",
    sortBy: (searchParams.sortBy as string) || "createdAt",
    sortOrder: (searchParams.sortOrder as string) || "desc",
    page: String(page),
    pageSize: String(pageSize),
  })) as TicketList;

  if (data.items.length === 0) {
    return (
      <div className="card border bg-base-100">
        <div className="card-body items-center">
          <div className="opacity-60">No tickets</div>
        </div>
      </div>
    );
  }

  // build query base
  const baseQuery: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") baseQuery[k] = v;
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const prevPage = String(Math.max(1, page - 1));
  const nextPage = String(Math.min(totalPages, page + 1));
  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  return (
    <div className="card bg-base-100 ">
      <div className="card-body p-0">
        <div className="overflow-x-auto rounded p-6">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t.id} className="hover">
                  <td className="max-w-[420px]">
                    <Link className="link link-hover font-medium" href={`/tickets/${t.id}`}>
                      {t.title}
                    </Link>
                    {/* {t.description ? (
                      <div className="text-xs opacity-60 line-clamp-1">{t.description}</div>
                    ) : null} */}
                  </td>
                  <td><PriorityBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td className="whitespace-nowrap">{new Date(t.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="p-3 flex items-center justify-between">
          <span className="opacity-70">
            Page {page} / {totalPages} • Total: {data.total}
          </span>
          <div className="join p-">
            <Link
              className={`btn btn-sm join-item ${atFirst ? "btn-disabled" : ""} mx-5`}
              aria-disabled={atFirst}
              href={{ pathname: "/tickets", query: { ...baseQuery, page: prevPage } }}
            >
              Prev
            </Link>
            <Link
              className={`btn btn-sm join-item ${atLast ? "btn-disabled" : ""}`}
              aria-disabled={atLast}
              href={{ pathname: "/tickets", query: { ...baseQuery, page: nextPage } }}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- Page: await searchParams -----------------
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link href="/tickets/create" className="btn btn-primary btn-sm">+ Create</Link>
      </div>

      <Toolbar searchParams={sp} />

      <Suspense fallback={<div className="animate-pulse h-32 rounded border" />}>
        {/* Server Component */}
        <List searchParams={sp} />
      </Suspense>
    </div>
  );
}
