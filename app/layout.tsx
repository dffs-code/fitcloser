import { SupabaseProvider } from "../components/SupabaseProvider";
import "./globals.css";

export const metadata = {
  title: "FitCloser — CRM para treinadores",
  description: "CRM moderno, propostas, contratos e follow-ups para treinadores pessoais."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
