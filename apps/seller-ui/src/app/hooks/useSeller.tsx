"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";

const fetchSeller = async () => {
  const response = await axiosInstance.get("/logged-in-user");
  return response.data.user;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { seller, isLoading, isError, refetch };
};

export default useSeller;
