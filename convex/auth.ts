import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

import type { DataModel } from "./_generated/dataModel";

const usernamePattern = /^[a-z0-9_]{3,24}$/;

const password = Password<DataModel>({
  profile: (params) => {
    const username = typeof params.username === "string" ? params.username.trim().toLowerCase() : "";
    if (!usernamePattern.test(username)) {
      throw new ConvexError("Username must be 3–24 characters: letters, numbers, or underscores.");
    }
    // Convex Auth's password provider uses an email-shaped account identifier.
    // Pokellects presents a username-only flow, so this internal value is never
    // shown to the player.
    const email = `${username}@accounts.pokellects.local`;

    // Password uses this callback for both sign-in and sign-up. Only collect
    // profile details at registration, so a later sign-in never overwrites a
    // trainer's role or other profile fields.
    if (params.flow !== "signUp") {
      return { email };
    }

    const firstName = typeof params.firstName === "string" ? params.firstName.trim() : "";
    const lastName = typeof params.lastName === "string" ? params.lastName.trim() : "";

    if (firstName.length < 2 || firstName.length > 40) {
      throw new ConvexError("Please enter your first name.");
    }

    return {
      email,
      name: [firstName, lastName].filter(Boolean).join(" "),
      username,
      firstName,
      ...(lastName ? { lastName } : {}),
      role: "player" as const,
      createdAt: Date.now(),
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
});
