import type { Metadata } from "next";
import "./globals.css";
import "./scheme.css";

export const metadata: Metadata = {
  title: "Seed Split Tool",
  description: "Offline Shamir secret sharing for seed phrases and recovery secrets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
