import Link from "next/link";
import { ticketsApi } from "@/lib/api";
import { Suspense } from "react";

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

  return (
    <form className="flex flex-wrap gap-2 mb-4">
      <input
        name="search"
        placeholder="Search..."
        defaultValue={search}
        className="input input-bordered"
      />
      <select name="status" defaultValue={status} className="select select-bordered">
        <option value="">Status</option>
        <option>OPEN</option>
        <option>IN_PROGRESS</option>
        <option>RESOLVED</option>
      </select>
      <select name="priority" defaultValue={priority} className="select select-bordered">
        <option value="">Priority</option>
        <option>LOW</option>
        <option>MEDIUM</option>
        <option>HIGH</option>
      </select>
      <select name="sortBy" defaultValue={sortBy} className="select select-bordered">
        <option value="createdAt">Created</option>
        <option value="updatedAt">Updated</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
      </select>
      <select name="sortOrder" defaultValue={sortOrder} className="select select-bordered">
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
      <button className="btn btn-primary" type="submit">Apply</button>
      <Link href="/tickets/create" className="btn">Create</Link>
    </form>
  );
}

// ----------------- List -----------------
async function List({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = (searchParams.page as string) || "1";
  const pageSize = (searchParams.pageSize as string) || "10";

  const data = await ticketsApi.list({
    status: (searchParams.status as string) || "",
    priority: (searchParams.priority as string) || "",
    search: (searchParams.search as string) || "",
    sortBy: (searchParams.sortBy as string) || "createdAt",
    sortOrder: (searchParams.sortOrder as string) || "desc",
    page,
    pageSize,
  });

  if (data.items.length === 0) {
    return <div className="p-6 rounded border text-center">No tickets</div>;
  }

  const baseQuery: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") baseQuery[k] = v;
  }

  const prevPage = String(Math.max(1, Number(page) - 1));
  const nextPage = String(Number(page) + 1);

  return (
    <div className="overflow-x-auto border rounded">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((t: any) => (
            <tr key={t.id} className="hover">
              <td>
                <Link className="link" href={`/tickets/${t.id}`}>
                  {t.title}
                </Link>
              </td>
              <td>{t.priority}</td>
              <td>{t.status}</td>
              <td>{new Date(t.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between p-3">
        <span>Total: {data.total}</span>
        <div className="flex gap-2">
          <Link
            className="btn btn-sm"
            href={{ pathname: "/tickets", query: { ...baseQuery, page: prevPage } }}
          >
            Prev
          </Link>
          <Link
            className="btn btn-sm"
            href={{ pathname: "/tickets", query: { ...baseQuery, page: nextPage } }}
          >
            Next
          </Link>
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
      <h1 className="text-2xl font-semibold">Tickets</h1>
      <Toolbar searchParams={sp} />
      <Suspense fallback={<div className="animate-pulse h-32 rounded border" />}>
        {/* Server Component */}
        <List searchParams={sp} />
      </Suspense>
    </div>
  );
}
