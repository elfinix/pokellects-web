import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const userRole = v.union(v.literal("player"), v.literal("admin"));

const theme = v.union(v.literal("light"), v.literal("dark"));

const minigamesView = v.union(v.literal("grid"), v.literal("row"));

const gameType = v.union(
  v.literal("whos_that_pokemon"),
  v.literal("hangmon"),
  v.literal("identicry"),
  v.literal("biologist"),
  v.literal("pokedle"),
);

const discoveryMethod = v.union(
  v.literal("starter_grant"),
  v.literal("manual_dex_input"),
  v.literal("whos_that_pokemon"),
  v.literal("hangmon"),
  v.literal("identicry"),
  v.literal("biologist"),
  v.literal("pokedle"),
);

export default defineSchema({
  ...authTables,

  users: defineTable({
    // Fields required by Convex Auth. Custom profile fields stay optional so
    // existing imported records remain valid and providers can create users.
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    authSubject: v.optional(v.string()),
    legacyId: v.optional(v.string()),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    birthday: v.optional(v.string()),
    role: v.optional(userRole),
    department: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_authSubject", ["authSubject"])
    .index("by_legacyId", ["legacyId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  userSettings: defineTable({
    userId: v.id("users"),
    theme,
    minigamesView,
    soundEnabled: v.boolean(),
    reducedMotion: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  pokedexEntries: defineTable({
    userId: v.id("users"),
    pokemonId: v.number(),
    unlockedAt: v.number(),
    discoveryMethod,
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_pokemonId", ["userId", "pokemonId"])
    .index("by_userId_and_unlockedAt", ["userId", "unlockedAt"]),

  arenaSessions: defineTable({
    userId: v.id("users"),
    gameType,
    pokemonId: v.number(),
    isWon: v.boolean(),
    attemptsUsed: v.number(),
    timeTakenSeconds: v.optional(v.number()),
    playedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_playedAt", ["userId", "playedAt"])
    .index("by_gameType_and_playedAt", ["gameType", "playedAt"]),

  achievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    unlockedAt: v.optional(v.number()),
  }).index("by_userId_and_achievementId", ["userId", "achievementId"]),

  systemConfigs: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["key"]),
});
