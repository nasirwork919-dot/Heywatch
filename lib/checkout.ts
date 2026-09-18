import type { CartLine } from "./types";

type CartIdentityLine = Pick<CartLine, "productId" | "quantity">;

export function createCartSignature(items: CartIdentityLine[]): string {
  return [...items]
    .sort((left, right) => left.productId.localeCompare(right.productId))
    .map((item) => `${item.productId}:${item.quantity}`)
    .join("|");
}
