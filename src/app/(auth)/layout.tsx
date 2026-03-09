import { ReactNode } from "react";
import Image from "next/image";

import StairBlockVividPurple from "@/components/illustration/StairBlockVividPurple";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="relative min-h-screen">
      {/* Content Container */}
      <div className="grid grid-cols-2 space-y-4 min-h-screen overflow-y-auto">
        <div className="col-span-2 mt-8 flex justify-center text-center">
          <Image
            src="/stairpay-logo.svg"
            alt="Stairpay Logo"
            width={40}
            height={40}
          />
        </div>
        <div className="z-10 col-span-2 md:col-span-1">{children}</div>
      </div>

      <div className="fixed bottom-0 right-0 z-0 hidden md:inline-flex">
        <StairBlockVividPurple scale={1.7} />
      </div>
    </main>
  );
};

export default Layout;
