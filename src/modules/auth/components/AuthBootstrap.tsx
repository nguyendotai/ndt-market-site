"use client";

import { useEffect } from "react";
import { initializeAuth } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      void dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  return children;
}
