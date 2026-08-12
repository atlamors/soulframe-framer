"use client";

import { useActionState } from "react";
import type { CreatorProfile } from "../../server/contracts/auth";
import {
  activateCreatorProfileAction,
  updateCreatorProfileAction,
  type CreatorProfileActionState,
} from "./actions";

const INITIAL_STATE: CreatorProfileActionState = {
  status: "idle",
  message: "",
};

const fieldClassName =
  "min-h-11 w-full border border-line-bright/50 bg-surface-deep px-3 font-sans text-sm text-ink outline-none focus:border-gold focus:shadow-focus";
const slugFieldClassName =
  "min-h-11 min-w-0 flex-1 border-0 bg-transparent px-2 font-sans text-sm font-bold text-ink outline-none";
const labelClassName =
  "grid gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-gold";
const submitClassName =
  "min-h-11 cursor-pointer border border-gold bg-control-hover px-4 font-sans text-sm font-bold uppercase tracking-wide text-gold-bright shadow-control-active disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-focus";

function ActionMessage({ state }: { state: CreatorProfileActionState }) {
  if (state.status === "idle") return null;
  return (
    <p
      className={state.status === "error" ? "text-danger" : "text-gold-bright"}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function CreatorProfileForm({
  profile,
  suggestedDisplayName,
  returnTo,
}: {
  profile: CreatorProfile | null;
  suggestedDisplayName: string;
  returnTo?: string;
}) {
  const action = profile
    ? updateCreatorProfileAction
    : activateCreatorProfileAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  if (!profile) {
    return (
      <form action={formAction} className="mt-6 grid gap-5">
        {returnTo ? <input type="hidden" name="next" value={returnTo} /> : null}
        <label className={labelClassName}>
          Public profile URL
          <span className="flex min-h-11 w-full items-stretch border border-line-bright/50 bg-surface-deep focus-within:border-gold focus-within:shadow-focus">
            <span className="flex flex-none items-center border-r border-line/70 bg-control px-3 font-sans text-xs font-normal normal-case tracking-normal text-ink-faint">
              /u/
            </span>
            <input
              className={slugFieldClassName}
              name="handle"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-label="Creator profile URL slug"
              aria-describedby="creator-handle-help"
              placeholder="your-name"
            />
            <span className="flex flex-none items-center border-l border-line/70 bg-control px-3 font-sans text-xs font-normal normal-case tracking-normal text-ink-faint">
              /
            </span>
          </span>
          <span
            id="creator-handle-help"
            className="font-normal normal-case tracking-normal text-ink-faint"
          >
            Choose once. Use lowercase letters, numbers, and hyphens. This URL
            cannot be changed after activation.
          </span>
        </label>
        <label className={labelClassName}>
          Display name
          <input
            className={fieldClassName}
            name="displayName"
            required
            maxLength={120}
            defaultValue={suggestedDisplayName}
            autoComplete="name"
          />
        </label>
        <ActionMessage state={state} />
        <button className={submitClassName} type="submit" disabled={pending}>
          {pending ? "Activating…" : "Activate Creator Profile"}
        </button>
      </form>
    );
  }

  return (
    <form action={formAction} className="mt-6 grid gap-5">
      {returnTo ? <input type="hidden" name="next" value={returnTo} /> : null}
      <div>
        <p className="font-sans text-xs font-bold uppercase tracking-wide text-gold">
          Public profile URL
        </p>
        <p className="mt-1 border border-line-bright/35 bg-surface-deep px-3 py-2.5 font-sans text-sm text-ink">
          <span className="text-ink-faint">/u/</span>
          <strong>{profile.handle}</strong>
          <span className="text-ink-faint">/</span>
        </p>
      </div>
      <label className={labelClassName}>
        Display name
        <input
          className={fieldClassName}
          name="displayName"
          required
          maxLength={120}
          defaultValue={profile.displayName}
          autoComplete="name"
        />
      </label>
      <label className={labelClassName}>
        Bio
        <textarea
          className={`${fieldClassName} min-h-32 resize-y py-3`}
          name="bio"
          maxLength={1000}
          defaultValue={profile.bio ?? ""}
        />
      </label>
      <ActionMessage state={state} />
      <button className={submitClassName} type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Creator Profile"}
      </button>
    </form>
  );
}
