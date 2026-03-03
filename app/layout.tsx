import "@/app/_styles/globals.css";

import { Quicksand } from "next/font/google";

const font = Quicksand({
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: {
    template: "%s | Kallo",
    default: "Your calorie tracker | Kallo",
  },
  description:
    "Kallo is a calorie tracking app that helps you stay on top of your nutrition and achieve your health goals. With Kallo, you can easily log your meals, track your calorie intake, and monitor your progress over time. Whether you're looking to lose weight, maintain a healthy lifestyle, or simply stay informed about your eating habits, Kallo provides the tools you need to succeed. Start your journey towards better health with Kallo today!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${font.className} bg-primary-100 text-primary-800 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
