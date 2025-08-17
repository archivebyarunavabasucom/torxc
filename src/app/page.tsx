"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  const [url, setUrl] = useState("");
  const [magnet, setMagnet] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!url) return;
    setLoading(true);
    toast.loading("Processing...", { description: "Fetching magnet link..." });
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
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!magnet) return;
    await navigator.clipboard.writeText(magnet);
    toast.success("Magnet copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">🍙 Torrent Magnet Extractor</h1>

        {/* <Input
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Paste PirateBay URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        /> */}
        <Textarea 
        // className="bg-gray-800  text-white"
          placeholder="Paste PirateBay URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />


        <Button onClick={handleExtract} className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Extract Magnet"}
        </Button>

        {magnet && (
          <div className="space-y-2 mt-4">
            <Button className="w-full" variant="secondary" onClick={copyToClipboard}>
              Copy Magnet
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              aria-expanded={show}
              onClick={() => setShow((s) => !s)}
            >
              {show ? "Hide Magnet" : "Show Magnet"}
            </Button>
            {show ? (
              <p className="text-sm break-all bg-gray-900 p-3 rounded-lg">
                {magnet}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
