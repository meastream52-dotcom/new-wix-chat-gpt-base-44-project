"use client";

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment";
  targetId: string;
}) {
  async function report() {
    const reason = window.prompt(`Why are you reporting this ${targetType}?`);
    if (!reason) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason }),
    });
    alert(res.ok ? "Thanks — a moderator will take a look." : "Could not submit the report.");
  }

  return (
    <button onClick={report} className="text-xs text-gray-400 hover:text-red-600">
      Report
    </button>
  );
}
