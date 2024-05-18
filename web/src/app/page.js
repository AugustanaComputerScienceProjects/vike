import defaultImage from "@/assets/default.jpg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center gap-8">
        <div className="relative w-full max-w-lg">
          <Image
            src={defaultImage}
            className="rounded-xl"
            alt="Event Preview"
            priority
          />
        </div>
        <h1 className="text-6xl font-">Discover events at Augie!</h1>
        <p className="mt-4 text-xl ">
          Create events, invite friends and discover new events on campus.
        </p>
        <Button>
          <Link href="/create">Create Your First Event</Link>
        </Button>
      </main>
      <footer className="text-center p-4">© 2024 Vike</footer>
    </div>
  );
}
