import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const userRole = v.union(v.literal("player"), v.literal("admin"));

const theme = v.union(v.literal("light"), v.literal("dark"));

const minigamesView = v.union(v.literal("grid"), v.literal("row"));

const discoveryMethod = v.union(
  v.literal("starter_grant"),
  v.literal("manual_dex_input"),
  v.literal("whos_that_pokemon"),
  v.literal("hangmon"),
  v.literal("identicry"),
  v.literal("biologist"),
  v.literal("pokedle"),
);

const legacyUser = v.object({
  legacyId: v.string(),
  username: v.string(),
  email: v.string(),
  firstName: v.string(),
  lastName: v.optional(v.string()),
  birthday: v.optional(v.string()),
  role: userRole,
  department: v.optional(v.string()),
  createdAt: v.number(),
  settings: v.object({
    theme,
    minigamesView,
    soundEnabled: v.boolean(),
    reducedMotion: v.boolean(),
    updatedAt: v.number(),
  }),
});

/**
 * One-time, re-runnable import for the two approved legacy accounts.
 * This remains internal: it is callable from the Convex CLI, never the browser.
 */
export const importLegacyProfiles = internalMutation({
  args: {
    users: v.array(legacyUser),
    pokedexEntries: v.array(
      v.object({
        legacyUserId: v.string(),
        pokemonId: v.number(),
        unlockedAt: v.number(),
        discoveryMethod,
      }),
    ),
  },
  returns: v.object({
    usersUpserted: v.number(),
    pokedexEntriesUpserted: v.number(),
  }),
  handler: async (ctx, args) => {
    const importedUserIds = new Map<string, Id<"users">>();

    for (const user of args.users) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_legacyId", (q) => q.eq("legacyId", user.legacyId))
        .unique();

      const userDocument = {
        legacyId: user.legacyId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        ...(user.lastName === undefined ? {} : { lastName: user.lastName }),
        ...(user.birthday === undefined ? {} : { birthday: user.birthday }),
        role: user.role,
        ...(user.department === undefined ? {} : { department: user.department }),
        createdAt: user.createdAt,
      };

      const userId = existing
        ? (await ctx.db.replace("users", existing._id, userDocument), existing._id)
        : await ctx.db.insert("users", userDocument);

      const existingSettings = await ctx.db
        .query("userSettings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      const settingsDocument = { userId, ...user.settings };
      if (existingSettings) {
        await ctx.db.replace("userSettings", existingSettings._id, settingsDocument);
      } else {
        await ctx.db.insert("userSettings", settingsDocument);
      }

      importedUserIds.set(user.legacyId, userId);
    }

    let pokedexEntriesUpserted = 0;
    for (const entry of args.pokedexEntries) {
      const userId = importedUserIds.get(entry.legacyUserId);
      if (!userId) throw new Error(`No imported user for legacy ID ${entry.legacyUserId}.`);

      const existing = await ctx.db
        .query("pokedexEntries")
        .withIndex("by_userId_and_pokemonId", (q) => q.eq("userId", userId).eq("pokemonId", entry.pokemonId))
        .unique();

      const entryDocument = {
        userId,
        pokemonId: entry.pokemonId,
        unlockedAt: entry.unlockedAt,
        discoveryMethod: entry.discoveryMethod,
      };
      if (existing) {
        await ctx.db.replace("pokedexEntries", existing._id, entryDocument);
      } else {
        await ctx.db.insert("pokedexEntries", entryDocument);
      }
      pokedexEntriesUpserted += 1;
    }

    return { usersUpserted: args.users.length, pokedexEntriesUpserted };
  },
});
