"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"; // shadcn/ui dropdown :contentReference[oaicite:0]{index=0}
import { Settings } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [magnet, setMagnet] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
   const [menuOpen, setMenuOpen] = useState(false);

  // Extract magnet link
  const handleExtract = async () => {
    if (!url) return;
    setLoading(true);
    const toastId = toast.loading("Processing...", { description: "Fetching magnet link..." });
    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data?.magnet && data.magnet !== "not found") {
        setMagnet(data.magnet);
        setShow(false);
        toast.success("Magnet link fetched!");
      } else {
        toast.error("Magnet not found on page");
      }
    } catch {
      toast.error("Failed to fetch URL");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  // Save API key
  const saveApiKey = () => {
    if (!apiKey) return toast.error("Enter a valid API key");
    localStorage.setItem("torbox_api_key", apiKey);
    toast.success("API key saved!");
    setMenuOpen(false); // <-- close dropdown
  };

  // Add magnet to TorBox
  const addToTorBox = async () => {
    if (!magnet) return toast.error("No magnet to add");
    const key = localStorage.getItem("torbox_api_key");
    if (!key) return toast.error("Set API key first");

    const toastId = toast.loading("Processing...", { description: "Adding to TorBox..." });
    try {
      const body = new FormData();
      body.append("magnet", magnet);

      const res = await fetch("https://api.torbox.app/v1/api/torrents/createtorrent", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) toast.success("Added to TorBox!");
      else toast.error(data.detail || "Failed to add to TorBox");
    } catch {
      toast.error("API error");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const copyToClipboard = async () => {
    if (!magnet) return;
    await navigator.clipboard.writeText(magnet);
    toast.success("Magnet copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-black relative p-6 flex items-center justify-center">
       <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>

            <Settings className="mr-2 mb-2 absolute top-4 right-4 text-white" /> 
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 p-4  rounded-md">
          <input
            type="text"
            placeholder="Enter API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 mb-2 text-black rounded"
          />
          <Button onClick={saveApiKey} className="w-full">
            Save
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Main UI */}
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-white">🍙 Torrent Magnet Extractor</h1>
        <Textarea
          placeholder="Paste PirateBay URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="text-white"
        />
        <Button onClick={handleExtract} className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Extract Magnet"}
        </Button>

        {magnet && (
          <div className="space-y-2 mt-4">
            <Button variant="secondary" className="w-full" onClick={copyToClipboard}>
              Copy Magnet
            </Button>
            <Button variant="secondary" className="w-full" aria-expanded={show} onClick={() => setShow((s) => !s)}>
              {show ? "Hide Magnet" : "Show Magnet"}
            </Button>
            {show && (
              <p className="text-sm break-all bg-gray-900 p-3 rounded-lg text-white">{magnet}</p>
            )}
            <Button variant="secondary" className="w-full bg-green-500 text-white" onClick={addToTorBox}>
              Add to TorBox
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
