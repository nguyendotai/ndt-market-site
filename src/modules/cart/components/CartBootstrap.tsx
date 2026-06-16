"use client";

import { useEffect, useRef } from "react";
import { initializeCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function CartBootstrap() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authInitialized = useAppSelector((state) => state.auth.isInitialized);
  const initializedForStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!authInitialized) return;
    if (authStatus === "loading" || authStatus === "idle") return;
    if (initializedForStatus.current === authStatus) return;

    initializedForStatus.current = authStatus;
    void dispatch(initializeCart());
  }, [authInitialized, authStatus, dispatch]);

  return null;
}
