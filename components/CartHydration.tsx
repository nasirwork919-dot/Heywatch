"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

export default function CartHydration() {
  useEffect(() => {
    let active = true;

    Promise.resolve(useCart.persist.rehydrate())
      .catch(() => {
        window.localStorage.removeItem("rlw-cart");
      })
      .finally(() => {
        if (active) useCart.getState().setHasHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
