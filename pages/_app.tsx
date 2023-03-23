import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{ maxWidth: "100vw", overflow: "hidden" }}>
      <SessionProvider session={pageProps.session}>
        <div className="fixed top-0 left-0 w-full bg-black text-white flex justify-center items-center gap-5">
          <Link href={"/"}>Home</Link>
          <Link href={"/admin/menu"}>Menu</Link>
        </div>
        <Component {...pageProps} />
      </SessionProvider>
    </div>
  );
}
