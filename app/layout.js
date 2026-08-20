export const metadata = {
  title: "Tathastu",
  description: "आयुर्वेद चिकित्सा सहायक",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
