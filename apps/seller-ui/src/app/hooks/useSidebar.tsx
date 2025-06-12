"use client";
import { useState } from "react";

const useSidebar = () => {
  const [currentActiveLink, setCurrentActiveLink] =
    useState<string>("/dashboard");

  return { currentActiveLink, setCurrentActiveLink };
};

export default useSidebar;
