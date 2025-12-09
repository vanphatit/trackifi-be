import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
} from "graphql";
import db from "../models/index.js";
import { getProductStatistics } from "../utils/productStatistics.js";

// Define Product Type
const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    price: { type: GraphQLFloat },
    discountPercent: { type: GraphQLFloat },
    stock: { type: GraphQLInt },
    images: {
      type: new GraphQLList(GraphQLString),
      resolve: (parent) => {
        // Handle if images is stored as JSON string or array
        if (typeof parent.images === "string") {
          try {
            return JSON.parse(parent.images);
          } catch (e) {
            return [];
          }
        }
        return parent.images;
      },
    },
    totalBuyers: {
      type: GraphQLInt,
      resolve: async (parent) => {
        const stats = await getProductStatistics(parent.id);
        return stats.totalBuyers;
      },
    },
    totalComments: {
      type: GraphQLInt,
      resolve: async (parent) => {
        const stats = await getProductStatistics(parent.id);
        return stats.totalComments;
      },
    },
  }),
});

// Define CartItem Type
const CartItemType = new GraphQLObjectType({
  name: "CartItem",
  fields: () => ({
    id: { type: GraphQLID },
    quantity: { type: GraphQLInt },
    isSelected: { type: GraphQLBoolean },
    product: {
      type: ProductType,
      resolve: async (parent) => {
        return await db.Product.findByPk(parent.productId);
      },
    },
    subtotal: {
      type: GraphQLFloat,
      resolve: async (parent) => {
        const product = await db.Product.findByPk(parent.productId);
        if (!product) return 0;
        const price =
          parseFloat(product.price) * (1 - product.discountPercent / 100);
        return price * parent.quantity;
      },
    },
  }),
});

// Define Cart Type
const CartType = new GraphQLObjectType({
  name: "Cart",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    items: {
      type: new GraphQLList(CartItemType),
      resolve: async (parent) => {
        return await db.CartItem.findAll({
          where: { cartId: parent.id },
          order: [["createdAt", "DESC"]],
        });
      },
    },
    total: {
      type: GraphQLFloat,
      resolve: async (parent) => {
        const items = await db.CartItem.findAll({
          where: { cartId: parent.id, isSelected: true },
          include: [{ model: db.Product, as: "product" }],
        });

        return items.reduce((sum, item) => {
          if (!item.product) return sum;
          const price =
            parseFloat(item.product.price) *
            (1 - item.product.discountPercent / 100);
          return sum + price * item.quantity;
        }, 0);
      },
    },
  }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    cart: {
      type: CartType,
      resolve: async (parent, args, context) => {
        // Context should contain the authenticated user
        // For simplicity, let's assume context.user or pass userId as arg for testing if auth not fully integrated in GraphQL context
        if (!context.user) {
          throw new Error("Unauthorized: Please log in to view cart");
        }

        let cart = await db.Cart.findOne({
          where: { userId: context.user.id },
        });
        if (!cart) {
          cart = await db.Cart.create({ userId: context.user.id });
        }
        return cart;
      },
    },
  },
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addToCart: {
      type: CartType,
      args: {
        productId: { type: new GraphQLNonNull(GraphQLID) },
        quantity: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }

        const { productId, quantity } = args;

        let cart = await db.Cart.findOne({
          where: { userId: context.user.id },
        });
        if (!cart) {
          cart = await db.Cart.create({ userId: context.user.id });
        }

        const existingItem = await db.CartItem.findOne({
          where: { cartId: cart.id, productId },
        });

        if (existingItem) {
          existingItem.quantity += quantity;
          await existingItem.save();
        } else {
          await db.CartItem.create({
            cartId: cart.id,
            productId,
            quantity,
            isSelected: true,
          });
        }

        return cart;
      },
    },
    updateCartItem: {
      type: CartType,
      args: {
        itemId: { type: new GraphQLNonNull(GraphQLID) },
        quantity: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) throw new Error("Unauthorized");
        if (args.quantity < 1) throw new Error("Quantity must be at least 1");

        const item = await db.CartItem.findByPk(args.itemId);
        if (!item) throw new Error("Item not found");

        // Verify ownership via cart
        const cart = await db.Cart.findByPk(item.cartId);
        if (cart.userId !== context.user.id) throw new Error("Unauthorized");

        item.quantity = args.quantity;
        await item.save();

        return cart;
      },
    },
    removeFromCart: {
      type: CartType,
      args: {
        itemId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) throw new Error("Unauthorized");

        const item = await db.CartItem.findByPk(args.itemId);
        if (!item) throw new Error("Item not found");

        const cart = await db.Cart.findByPk(item.cartId);
        if (cart.userId !== context.user.id) throw new Error("Unauthorized");

        await item.destroy();
        return cart;
      },
    },
    selectCartItems: {
      type: CartType,
      args: {
        itemIds: { type: new GraphQLList(GraphQLID) }, // if null/empty, maybe select all? Or strict list.
        isSelected: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) throw new Error("Unauthorized");

        const cart = await db.Cart.findOne({
          where: { userId: context.user.id },
        });
        if (!cart) return null;

        // If itemIds provided, update specific ones. If not, update all?
        // Let's assume itemIds is required for specific selection, or simple bulk toggle if logic demands.
        // For this requirement: "select specific items (single or multiple)"
        if (args.itemIds && args.itemIds.length > 0) {
          await db.CartItem.update(
            { isSelected: args.isSelected },
            {
              where: {
                id: args.itemIds,
                cartId: cart.id,
              },
            }
          );
        } else {
          // If no IDs provided, perhaps user wants to toggle ALL?
          // Let's implementing "select all" if list is empty for convenience, or just return cart.
          // The prompt says "select specific items", but standard cart UX often needs "select all".
          // I'll implement: if itemIds is present, update them.
        }

        return cart;
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
