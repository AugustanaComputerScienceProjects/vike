import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableFacetedFilterProps {
  column: any;
  title: string;
  options: { label: string; value: string; }[];
  onAdd?: () => void;
}

export function DataTableFacetedFilter({
  column,
  title,
  options,
  onAdd,
}: DataTableFacetedFilterProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(() => {
    const initialValue = column?.getFilterValue()?.[0];
    return initialValue || null;
  });

  const handleSelect = (value: string) => {
    if (value === selectedValue) {
      setSelectedValue(null);
      column?.setFilterValue(undefined);
    } else {
      setSelectedValue(value);
      column?.setFilterValue([value]);
    }
  };

  useEffect(() => {
    const currentFilter = column?.getFilterValue()?.[0];
    if (currentFilter !== selectedValue) {
      setSelectedValue(currentFilter || null);
    }
  }, [column?.getFilterValue()]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValue && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {options.find(opt => opt.value === selectedValue)?.label || selectedValue}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {onAdd && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={onAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {title}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 