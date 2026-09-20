import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    bio: v.optional(v.string()),
    favoriteType: v.optional(v.string()),
    favoriteRegion: v.optional(v.string()),
    leadPartnerId: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Sign in required.");
    }
    await ctx.db.patch(userId, {
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.favoriteType !== undefined && { favoriteType: args.favoriteType }),
      ...(args.favoriteRegion !== undefined && { favoriteRegion: args.favoriteRegion }),
      ...(args.leadPartnerId !== undefined && { leadPartnerId: args.leadPartnerId }),
    });
    return null;
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    deleted: v.object({
      pokedexEntries: v.number(),
      arenaSessions: v.number(),
      achievements: v.number(),
      userSettings: v.number(),
      authAccounts: v.number(),
      authSessions: v.number(),
      authRefreshTokens: v.number(),
      authVerificationCodes: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) {
      throw new Error("Unauthorized: Sign in required.");
    }

    const caller = await ctx.db.get(callerId);
    const isSelf = callerId === args.userId;
    const isAdmin = caller?.role === "admin";

    if (!isSelf && !isAdmin) {
      throw new Error("Forbidden: You do not have permission to delete this user.");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }

    // 1. Cascade delete pokedexEntries
    const pokedexEntries = await ctx.db
      .query("pokedexEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const entry of pokedexEntries) {
      await ctx.db.delete(entry._id);
    }

    // 2. Cascade delete arenaSessions
    const arenaSessions = await ctx.db
      .query("arenaSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of arenaSessions) {
      await ctx.db.delete(session._id);
    }

    // 3. Cascade delete achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_userId_and_achievementId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const ach of achievements) {
      await ctx.db.delete(ach._id);
    }

    // 4. Cascade delete userSettings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }

    // 5. Cascade delete systemConfigs updatedBy references
    const systemConfigs = await ctx.db.query("systemConfigs").collect();
    for (const config of systemConfigs) {
      if (config.updatedBy === args.userId) {
        await ctx.db.patch(config._id, { updatedBy: undefined });
      }
    }

    // 6. Cascade delete Convex Auth tables:
    // a. Accounts and their verification codes
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect();

    let deletedCodesCount = 0;
    for (const account of authAccounts) {
      const verificationCodes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();
      for (const code of verificationCodes) {
        await ctx.db.delete(code._id);
        deletedCodesCount++;
      }
      await ctx.db.delete(account._id);
    }

    // b. Sessions and their refresh tokens
    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    let deletedTokensCount = 0;
    for (const session of authSessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
        deletedTokensCount++;
      }
      await ctx.db.delete(session._id);
    }

    // 7. Finally delete the user document
    await ctx.db.delete(args.userId);

    return {
      success: true,
      deleted: {
        pokedexEntries: pokedexEntries.length,
        arenaSessions: arenaSessions.length,
        achievements: achievements.length,
        userSettings: settings.length,
        authAccounts: authAccounts.length,
        authSessions: authSessions.length,
        authRefreshTokens: deletedTokensCount,
        authVerificationCodes: deletedCodesCount,
      },
    };
  },
});
