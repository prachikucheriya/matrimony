
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  userName: string;
};

export default function DeleteUserButton({
  userId,
  userName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${userName}"?\n\n` +
      "This will remove the account, profile, interests and related chats. " +
      "This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete account");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
