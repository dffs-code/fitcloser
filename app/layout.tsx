import { Toaster } from "react-hot-toast";
import { SupabaseProvider } from "../components/SupabaseProvider";
import "./globals.css";

export const metadata = {
  title: "FitCloser — CRM para treinadores",
  description: "CRM moderno, propostas, contratos e follow-ups para treinadores pessoais.",
  icons: {
    icon: "/fitcloser.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "1rem",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: "14px",
              fontWeight: 500,
              padding: "12px 18px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              border: "1px solid #e2e8f0"
            },
            success: {
              duration: 2500,
              iconTheme: { primary: "#10b981", secondary: "#ffffff" }
            },
            error: {
              duration: 4000,
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" }
            },
            loading: {
              iconTheme: { primary: "#3c5dff", secondary: "#ffffff" }
            }
          }}
        />
      </body>
    </html>
  );
}
