"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// this creates the client
const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Provider;
