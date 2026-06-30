import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import type { MenuApiResponse } from "@/types/menuTypes";

function readMenu(): MenuApiResponse {
  const filePath = path.join(process.cwd(), "data", "menu.json");
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as MenuApiResponse;
  } catch {
    // Fallback: serve empty but valid response
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      categories: [],
      items: [],
    };
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const menu = readMenu();

  // Optionally filter by category
  const { category } = req.query;
  if (category && typeof category === "string") {
    const filtered = menu.items.filter((item) => item.category === category);
    return res.status(200).json({ ...menu, items: filtered });
  }

  return res.status(200).json(menu);
}

// Export for use in server-side components
export { readMenu };