import { Lato, Pacifico } from "next/font/google";

export const lato = Lato({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "700", "900"],
});

export const pacifico = Pacifico({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});
