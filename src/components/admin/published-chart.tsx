"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PublishedChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="h-56" role="img" aria-label={`Articles published per month: ${data.map((d) => `${d.month} ${d.count}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D7" vertical={false} />
          <XAxis dataKey="month" tickLine={false} />
          <YAxis allowDecimals={false} tickLine={false} width={28} />
          <Tooltip />
          <Bar dataKey="count" name="Published" fill="#1B3C35" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
