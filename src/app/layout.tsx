import type { Metadata } from "next";
import "./globals.css";
import "./scheme.css";
import "./multisig.css";

export const metadata: Metadata = {
  title: "Seed Split Tool — offline seed backup",
  description: "Локальный браузерный инструмент для генерации BIP-39, разделения и восстановления секретов, а также подготовки Bitcoin multisig descriptor.",
  applicationName: "Seed Split Tool",
  keywords: ["BIP-39", "SLIP-39", "Shamir Secret Sharing", "Bitcoin multisig", "wallet descriptor", "offline backup"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
