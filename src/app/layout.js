import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "SubPanel",
  description: "Subpanel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${poppins.variable} antialiased bg-night`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
