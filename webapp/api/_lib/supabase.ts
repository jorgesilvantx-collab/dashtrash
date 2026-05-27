// Minimal Supabase REST client built on fetch — no @supabase/supabase-js
// dependency so Vercel's bundler can't fail to resolve it. Supports the chain
// methods our signup endpoints actually use: .select / .insert / .update /
// .eq / .in / .is / .limit / .single / .head + exact count.

const URL_BASE = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE || "";

type Filter = { col: string; op: "eq" | "in" | "is"; value: unknown };

class Query {
  private table: string;
  private filters: Filter[] = [];
  private selectCols: string | null = null;
  private wantSingle = false;
  private headOnly = false;
  private countMode: "exact" | null = null;
  private limitN: number | null = null;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private bodyData: unknown = undefined;
  private returnAfterMutate = false;

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string = "*", opts?: { count?: "exact"; head?: boolean }) {
    this.selectCols = cols;
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.headOnly = true;
    if (this.method === "GET") this.method = "GET";
    if (this.method === "POST" || this.method === "PATCH") this.returnAfterMutate = true;
    return this;
  }

  insert(row: unknown) {
    this.method = "POST";
    this.bodyData = Array.isArray(row) ? row : [row];
    return this;
  }

  update(row: unknown) {
    this.method = "PATCH";
    this.bodyData = row;
    return this;
  }

  eq(col: string, value: unknown) {
    this.filters.push({ col, op: "eq", value });
    return this;
  }

  in(col: string, values: unknown[]) {
    this.filters.push({ col, op: "in", value: values });
    return this;
  }

  is(col: string, value: unknown) {
    this.filters.push({ col, op: "is", value });
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    this.wantSingle = true;
    return this;
  }

  private buildUrl(): string {
    const params = new URLSearchParams();
    if (this.selectCols) params.append("select", this.selectCols);
    for (const f of this.filters) {
      if (f.op === "eq") params.append(f.col, `eq.${String(f.value)}`);
      else if (f.op === "is") params.append(f.col, `is.${String(f.value)}`);
      else if (f.op === "in") {
        const arr = (f.value as unknown[]).map((v) => String(v)).join(",");
        params.append(f.col, `in.(${arr})`);
      }
    }
    if (this.limitN != null) params.append("limit", String(this.limitN));
    const qs = params.toString();
    return `${URL_BASE}/rest/v1/${this.table}${qs ? "?" + qs : ""}`;
  }

  async run(): Promise<{ data: unknown; error: { message: string } | null; count?: number }> {
    if (!URL_BASE || !KEY) {
      return { data: null, error: { message: "Supabase env not configured" } };
    }
    const headers: Record<string, string> = {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    };
    const preferParts: string[] = [];
    if (this.method === "POST" || this.method === "PATCH") {
      preferParts.push(this.returnAfterMutate ? "return=representation" : "return=minimal");
    }
    if (this.countMode) preferParts.push(`count=${this.countMode}`);
    if (this.wantSingle) headers["Accept"] = "application/vnd.pgrst.object+json";
    if (preferParts.length) headers["Prefer"] = preferParts.join(",");

    try {
      const url = this.buildUrl();
      const res = await fetch(url, {
        method: this.headOnly ? "HEAD" : this.method,
        headers,
        body: this.method === "POST" || this.method === "PATCH" ? JSON.stringify(this.bodyData) : undefined,
      });

      let count: number | undefined;
      const cr = res.headers.get("content-range");
      if (cr) {
        const m = cr.match(/\/(\d+|\*)$/);
        if (m && m[1] !== "*") count = parseInt(m[1], 10);
      }

      if (this.headOnly) {
        if (!res.ok) return { data: null, error: { message: `HTTP ${res.status}` }, count };
        return { data: null, error: null, count };
      }

      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try { parsed = JSON.parse(text); } catch { parsed = text; }
      }

      if (!res.ok) {
        const msg =
          parsed && typeof parsed === "object" && parsed !== null && "message" in parsed
            ? String((parsed as { message: unknown }).message)
            : `HTTP ${res.status}`;
        return { data: null, error: { message: msg }, count };
      }

      return { data: parsed, error: null, count };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : "fetch failed" } };
    }
  }

  // Allow `await query` — implement thenable.
  then<TResult1 = { data: unknown; error: { message: string } | null; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: { message: string } | null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export const admin = {
  from(table: string) {
    return new Query(table);
  },
};
