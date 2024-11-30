import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Check, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Button } from "../ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const LocationField = ({ form, control, name, label, placeholder }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"] as const,
  });

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);

  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) return <div>Error loading maps</div>;

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Location
              form={form}
              name={name}
              placeholder={placeholder}
              selected={selected}
              setSelected={setSelected}
            />
          </FormControl>
          {selected && (
            <GoogleMap
              center={{ lat: selected.lat, lng: selected.lng }}
              zoom={16}
              mapContainerClassName="w-full h-[150px]"
              options={{
                disableDefaultUI: true,
                disableDoubleClickZoom: true,
              }}
            >
              <Marker position={selected} />
            </GoogleMap>
          )}
        </FormItem>
      )}
    />
  );
};

const Location = ({ form, name, placeholder, selected, setSelected }) => {
  const inputRef = useRef(null);
  const [inputWidth, setInputWidth] = useState("auto");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(`${inputRef.current.offsetWidth}px`);
    }
  }, []);

  const {
    ready,
    value,
    setValue,
    suggestions: { data },
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });
    form.setValue(name, results[0].formatted_address);
    setOpen(false);
  };

  const handleInputChange = (input) => {
    setValue(input);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={inputRef}
          variant="outline"
          role="combobox"
          className="w-full justify-between gap-1"
        >
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            {value || placeholder}
          </div>
          {selected && (
            <X
              className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={() => {
                setValue("");
                setSelected(null);
                form.setValue(name, "");
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: inputWidth }}>
        <Command>
          <CommandInput
            disabled={!ready}
            onValueChange={handleInputChange}
            placeholder={placeholder}
            className="h-9 combobox-input"
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>

            <CommandGroup>
              {data.map(({ description }) => (
                <CommandItem
                  key={description}
                  value={description}
                  onSelect={(value) => handleSelect(value)}
                >
                  {description}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      description === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationField;
