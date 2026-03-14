import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { adjustments, adjustmentLines, stockPerLocation, stockLedger } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateRef(): string {
  return `ADJ-${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`;
}

export const adjustmentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft","waiting","ready","done","canceled"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.adjustments.findMany({
        where: input.status ? eq(adjustments.status, input.status) : undefined,
        with: { lines: { with: { product: true } }, location: { with: { warehouse: true } } },
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        orderBy: (a, { desc }) => [desc(a.createdAt)],
      });
      return { items: rows, page: input.page, pageSize: input.pageSize };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const adj = await ctx.db.query.adjustments.findFirst({
        where: eq(adjustments.id, input.id),
        with: { lines: { with: { product: true } }, location: true },
      });
      if (!adj) throw new TRPCError({ code: "NOT_FOUND" });
      return adj;
    }),

  create: protectedProcedure
    .input(z.object({
      locationId: z.string().uuid(),
      notes: z.string().optional(),
      reason: z.string().optional(),
      lines: z.array(z.object({
        productId: z.string().uuid(),
        systemQuantity: z.number().min(0),
        countedQuantity: z.number().min(0),
        uom: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, ...rest } = input;
      const [adj] = await ctx.db.insert(adjustments).values({
        ...rest,
        reference: generateRef(),
        status: "draft",
        createdById: ctx.user!.id,
      }).returning();

      const linesWithDelta = lines.map(l => ({ ...l, adjustmentId: adj!.id, delta: l.countedQuantity - l.systemQuantity }));
      if (linesWithDelta.length) await ctx.db.insert(adjustmentLines).values(linesWithDelta);
      return adj;
    }),

  /**
   * CRITICAL: validate() — syncs physical count delta to stock_per_location
   * 1. For each line: applies delta (counted - system) to stock_per_location
   * 2. Inserts ledger entry with delta (can be positive or negative)
   */
  validate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adj = await ctx.db.query.adjustments.findFirst({
        where: and(eq(adjustments.id, input.id), eq(adjustments.status, "ready")),
        with: { lines: true },
      });
      if (!adj) throw new TRPCError({ code: "BAD_REQUEST", message: "Adjustment must be in 'ready' status." });

      await ctx.db.update(adjustments).set({ status: "done", validatedAt: new Date(), validatedById: ctx.user!.id, updatedAt: new Date() }).where(eq(adjustments.id, input.id));

      for (const line of adj.lines) {
        if (line.delta === 0) continue;

        // Apply delta to stock_per_location
        await ctx.db.insert(stockPerLocation)
          .values({ productId: line.productId, locationId: adj.locationId, quantityOnHand: line.countedQuantity })
          .onConflictDoUpdate({
            target: [stockPerLocation.productId, stockPerLocation.locationId],
            set: { quantityOnHand: line.countedQuantity, updatedAt: new Date() },
          });

        // Ledger entry — delta can be negative
        await ctx.db.insert(stockLedger).values({
          productId: line.productId,
          locationId: adj.locationId,
          quantityDelta: line.delta,
          operationType: "adjustment",
          documentId: adj.id,
          documentReference: adj.reference,
          userId: ctx.user!.id,
          notes: adj.reason ?? adj.notes,
        });
      }

      return { success: true };
    }),
});
