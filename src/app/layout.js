import "./globals.css";

export const metadata = {
  title: "FinTrack | Portfolio & Finance Management",
  description: "Track all your debit, credit, online payments, bank transfers, stocks, rentals, and more in a single minimalist interface.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
