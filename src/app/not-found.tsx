import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold">That ticket is not on the board</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been filed under another key, or the demo data was reset.
      </p>
      <Link href="/" className="mt-6 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
        Back to command
      </Link>
    </div>
  );
}
