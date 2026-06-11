import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-bold">Order received 🎉</h1>
      <p className="mt-3 text-ink-600">
        Your part is in the print queue. You&apos;ll get a confirmation email,
        and we&apos;ll follow up with tracking once it ships.
      </p>
      <Link href="/" className="btn-outline mt-6">
        Back to catalog
      </Link>
    </div>
  );
}
