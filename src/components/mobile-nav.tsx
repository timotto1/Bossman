"use client";

import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { PanelLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { PermissionGuard } from "@/guards/permission-guard";
import { helpItem, navSections } from "@/utils/lists";

export function MobileNav() {
  const pathname = usePathname();

  const baseLink =
    "rounded-sm flex gap-2 items-center py-2 px-4 text-[#87858E] hover:bg-[#F4F0FE] hover:text-[#AE78F1] ";
  const activeLink = "bg-[#F4F0FE] text-[#AE78F1]";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetTitle></SheetTitle>
        <nav className="flex-1 px-4 py-6 space-y-10">
          {navSections.map((section) => (
            <PermissionGuard
              key={section.title}
              permissions={section?.permissions ?? []}
            >
              <div key={section.title} className="space-y-2">
                <h4 className="text-sm text-[#B9B7BD] px-2">{section.title}</h4>
                {section.items.map(
                  ({ href, label, permissions, icon: Icon }, i) => (
                    <PermissionGuard key={href + i} permissions={permissions}>
                      <Link
                        href={href}
                        className={clsx(baseLink, {
                          [activeLink]: pathname === href,
                        })}
                      >
                        <Icon className="h-6 w-6" />
                        <h5 className="text-xs">{label}</h5>
                        <span className="sr-only">{label}</span>
                      </Link>
                    </PermissionGuard>
                  ),
                )}
              </div>
            </PermissionGuard>
          ))}
        </nav>
        <nav className="px-4 py-6">
          <Dialog>
            <DialogTrigger className={clsx(baseLink, "block w-full")}>
              <helpItem.icon className="h-6 w-6" />
              <h5 className="text-xs">{helpItem.label}</h5>
              <span className="sr-only">{helpItem.label}</span>
            </DialogTrigger>
            <DialogContent className="mx-auto max-w-[calc(100vw-32px)] md:max-w-md rounded-md border-none shadow-[0px_4px_25px_0px_#0000001A]">
              <DialogTitle>&nbsp;</DialogTitle>
              <div className="space-y-9 text-center">
                <div className="space-y-7 text-center">
                  <ShieldCheckIcon className="text-[#1F0B56] mx-auto w-20" />
                  <div className="space-y-2 max-w-[350px] mx-auto">
                    <h3 className="text-3xl text-[#1F0B56] font-bold">
                      Can’t find something?
                    </h3>
                    <h4 className="text-xl text-[#1F0B56]">
                      We’re here to help
                    </h4>
                    <div className="space-y-3 px-2">
                      <p className="text-xs text-[#1F0B56]">
                        Please share your Name, Company, and a few details about
                        your request. One of our team members will get back to
                        you within 24 hours.
                      </p>
                      <p className="text-xs text-[#1F0B56]">
                        Your feedback helps us improve, so don’t hesitate to
                        reach out with questions, issues, or suggestions.
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="mailto:hello@stairpay.com" className="inline-block">
                  <Button className="rounded-full h-auto px-3 py-2 text-white bg-[#1F0B56] hover:bg-[#1F0B56] text-xl font-medium">
                    Email us
                  </Button>
                </Link>
                <Image
                  className="mx-auto"
                  src={`/stairpay-logo-long.svg`}
                  alt={`/stairpay-logo-long.svg`}
                  width={120}
                  height={20}
                />
              </div>
            </DialogContent>
          </Dialog>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
