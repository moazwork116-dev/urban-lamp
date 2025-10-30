import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  createOrder,
  createOrderItem,
  updateOrderStatus,
  getOrderItemsByOrderId,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return getAllProducts();
    }),
    getById: publicProcedure.input((val: any) => {
      if (typeof val?.id !== "number") throw new Error("Invalid id");
      return val as { id: number };
    }).query(async ({ input }) => {
      return getProductById(input.id);
    }),
    create: protectedProcedure.input((val: any) => val).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return createProduct(input);
    }),
    update: protectedProcedure.input((val: any) => val).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return updateProduct(input.id, input.data);
    }),
    delete: protectedProcedure.input((val: any) => {
      if (typeof val?.id !== "number") throw new Error("Invalid id");
      return val as { id: number };
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return deleteProduct(input.id);
    }),
  }),

  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return getAllOrders();
      }
      return getOrdersByUserId(ctx.user.id);
    }),
    getById: publicProcedure.input((val: any) => {
      if (typeof val?.id !== "number") throw new Error("Invalid id");
      return val as { id: number };
    }).query(async ({ input }) => {
      return getOrderById(input.id);
    }),
    create: publicProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const orderResult = await createOrder(input.order);
      const orderId = (orderResult as any).insertId as number;
      
      for (const item of input.items) {
        await createOrderItem({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        });
      }
      
      return { orderId };
    }),
    updateStatus: protectedProcedure.input((val: any) => val).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return updateOrderStatus(input.id, input.status);
    }),
    getItems: publicProcedure.input((val: any) => {
      if (typeof val?.orderId !== "number") throw new Error("Invalid orderId");
      return val as { orderId: number };
    }).query(async ({ input }) => {
      return getOrderItemsByOrderId(input.orderId);
    }),
  }),
});

export type AppRouter = typeof appRouter;
