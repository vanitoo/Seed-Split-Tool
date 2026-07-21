import type { Metadata } from "next";
import "./globals.css";
import "./scheme.css";

export const metadata: Metadata = {
  title: "Seed Split Tool — offline seed backup",
  description: "Локальный браузерный инструмент для генерации BIP-39, разделения и восстановления секретов через SLIP-39, Banana Split и Generic SST1.",
  applicationName: "Seed Split Tool",
  keywords: ["BIP-39", "SLIP-39", "Shamir Secret Sharing", "seed phrase", "offline backup"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
