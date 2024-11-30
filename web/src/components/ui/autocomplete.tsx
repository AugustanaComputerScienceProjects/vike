"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export default function ComboboxInput() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [value, setValue] = React.useState("");

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Command>
          <PopoverPrimitive.Anchor asChild>
            <CommandPrimitive.Input
              asChild
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => setOpen(e.key !== "Escape")}
              onMouseDown={() => setOpen((open) => !!search || !open)}
              onFocus={() => setOpen(true)}
              onBlur={(e) => {
                if (!e.relatedTarget?.hasAttribute("cmdk-list")) {
                  setSearch(
                    value
                      ? frameworks.find(
                          (framework) => framework.value === value
                        )?.label ?? ""
                      : ""
                  );
                }
              }}
            >
              <Input placeholder="Select framework..." className="w-[200px]" />
            </CommandPrimitive.Input>
          </PopoverPrimitive.Anchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute("cmdk-input")
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setSearch(
                        currentValue === value
                          ? ""
                          : frameworks.find(
                              (framework) => framework.value === currentValue
                            )?.label ?? ""
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {framework.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
}
