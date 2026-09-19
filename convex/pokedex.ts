import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const discoveryMethod = v.union(v.literal("starter_grant"), v.literal("manual_dex_input"), v.literal("whos_that_pokemon"), v.literal("hangmon"), v.literal("identicry"), v.literal("biologist"), v.literal("pokedle"));
const entry = v.object({ pokemonId: v.number(), unlockedAt: v.number(), discoveryMethod });

export const mine = query({
  args: {}, returns: v.array(entry),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return (await ctx.db.query("pokedexEntries").withIndex("by_userId", (q) => q.eq("userId", userId)).collect())
      .map(({ pokemonId, unlockedAt, discoveryMethod }) => ({ pokemonId, unlockedAt, discoveryMethod }));
  },
});

export const ensureStarter = mutation({
  args: {}, returns: v.boolean(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to access your Pokédex.");
    const user = await ctx.db.get(userId);
    if (!user || user.legacyId) return false;
    const existing = await ctx.db.query("pokedexEntries").withIndex("by_userId_and_pokemonId", (q) => q.eq("userId", userId).eq("pokemonId", 25)).unique();
    if (existing) return false;
    await ctx.db.insert("pokedexEntries", { userId, pokemonId: 25, unlockedAt: Date.now(), discoveryMethod: "starter_grant" });
    return true;
  },
});

export const register = mutation({
  args: { pokemonId: v.number(), discoveryMethod }, returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to register Pokémon.");
    const existing = await ctx.db.query("pokedexEntries").withIndex("by_userId_and_pokemonId", (q) => q.eq("userId", userId).eq("pokemonId", args.pokemonId)).unique();
    if (existing) return false;
    await ctx.db.insert("pokedexEntries", { userId, pokemonId: args.pokemonId, unlockedAt: Date.now(), discoveryMethod: args.discoveryMethod });
    return true;
  },
});
