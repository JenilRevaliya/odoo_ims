import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { deliveries, deliveryLines, stockPerLocation, stockLedger } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateRef(): string {
  const n = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `WH/OUT/${n}`;
}

export const deliveriesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft","waiting","ready","done","canceled"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { status, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const rows = await ctx.db.query.deliveries.findMany({
        where: status ? eq(deliveries.status, status) : undefined,
        with: { lines: { with: { product: true } }, sourceLocation: { with: { warehouse: true } }, createdBy: { columns: { id: true, name: true } } },
        limit: pageSize,
        offset,
        orderBy: (d, { desc }) => [desc(d.createdAt)],
      });

      return { items: rows, page, pageSize };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const delivery = await ctx.db.query.deliveries.findFirst({
        where: eq(deliveries.id, input.id),
        with: { lines: { with: { product: true } }, sourceLocation: { with: { warehouse: true } } },
      });
      if (!delivery) throw new TRPCError({ code: "NOT_FOUND" });
      return delivery;
    }),

  create: protectedProcedure
    .input(z.object({
      customerName: z.string().optional(),
      deliveryAddress: z.string().optional(),
      sourceLocationId: z.string().uuid(),
      scheduledDate: z.string().optional(),
      notes: z.string().optional(),
      lines: z.array(z.object({ productId: z.string().uuid(), demandQuantity: z.number().min(1), uom: z.string().optional() })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { lines, ...rest } = input;
      const [delivery] = await ctx.db.insert(deliveries).values({
        ...rest,
        reference: generateRef(),
        status: "draft",
        createdById: ctx.user!.id,
        scheduledDate: rest.scheduledDate ? new Date(rest.scheduledDate) : undefined,
      }).returning();

      if (lines.length) {
        await ctx.db.insert(deliveryLines).values(lines.map(l => ({ ...l, deliveryId: delivery!.id, doneQuantity: 0 })));
      }
      return delivery;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["waiting","ready","canceled"]) }))
    .mutation(async ({ ctx, input }) => {
      const [d] = await ctx.db.update(deliveries).set({ status: input.status, updatedAt: new Date() }).where(eq(deliveries.id, input.id)).returning();
      if (!d) throw new TRPCError({ code: "NOT_FOUND" });
      return d;
    }),

  updateDoneQty: protectedProcedure
    .input(z.object({ lineId: z.string().uuid(), doneQuantity: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(deliveryLines).set({ doneQuantity: input.doneQuantity }).where(eq(deliveryLines.id, input.lineId));
      return { success: true };
    }),

  /**
   * CRITICAL: validate() — transitions to "done"
   * 1. Updates status to done
   * 2. For each line: decrements stock_per_location by doneQuantity
   * 3. Inserts immutable ledger entry with negative delta
   */
  validate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const delivery = await ctx.db.query.deliveries.findFirst({
        where: and(eq(deliveries.id, input.id), eq(deliveries.status, "ready")),
        with: { lines: true },
      });
      if (!delivery) throw new TRPCError({ code: "BAD_REQUEST", message: "Delivery must be in 'ready' status to validate." });

      const locationId = delivery.sourceLocationId!;

      // Pre-flight check: ensure sufficient stock for all lines
      for (const line of (delivery.lines as { id: string; productId: string; deliveryId: string; demandQuantity: number; doneQuantity: number; uom: string | null; createdAt: Date; product: { name: string } }[])) {
        const qty = line.doneQuantity;
        if (qty <= 0) continue;

        const stock = await ctx.db.query.stockPerLocation.findFirst({
          where: and(eq(stockPerLocation.productId, line.productId), eq(stockPerLocation.locationId, locationId)),
        });

        const currentStock = stock?.quantityOnHand ?? 0;
        if (currentStock < qty) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: `Insufficient stock for product '${line.product?.name ?? line.productId}'. Available: ${currentStock}, Required: ${qty}` 
          });
        }
      }

      await ctx.db.update(deliveries).set({ status: "done", validatedAt: new Date(), validatedById: ctx.user!.id, updatedAt: new Date() }).where(eq(deliveries.id, input.id));

      for (const line of (delivery.lines as { id: string; productId: string; deliveryId: string; demandQuantity: number; doneQuantity: number; uom: string | null; createdAt: Date }[])) {
        const qty = line.doneQuantity;
        if (qty <= 0) continue;

        await ctx.db.update(stockPerLocation)
          .set({ quantityOnHand: sql`${stockPerLocation.quantityOnHand} - ${qty}`, updatedAt: new Date() })
          .where(and(eq(stockPerLocation.productId, line.productId), eq(stockPerLocation.locationId, locationId)));

        await ctx.db.insert(stockLedger).values({
          productId: line.productId,
          locationId,
          quantityDelta: -qty, // negative = outgoing
          operationType: "delivery",
          documentId: delivery.id,
          documentReference: delivery.reference,
          userId: ctx.user!.id,
        });
      }

      return { success: true };
    }),
});
