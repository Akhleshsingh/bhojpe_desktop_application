import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), "src/data/mock");

const ROUTE_MAP: Record<string, string> = {
  "/api/v1/tables":                "tables",
  "/api/v1/waiters":               "waiters",
  "/api/v1/orders":                "orders",
  "/api/v1/menu-items":            "menu-items",
  "/api/v1/home-dashboard":        "home-dashboard",
  "/api/v1/delivery-executives":   "delivery-executives",
  "/api/v1/restaurant-roles":      "restaurant-roles",
  "/api/v1/getstaffs":             "getstaffs",
  "/api/v1/orderstatus":           "orderstatus",
  "/api/v1/branch-master-data":    "branch-master-data",
};

function findMockFile(urlPath: string): string | null {
  for (const [route, file] of Object.entries(ROUTE_MAP)) {
    if (urlPath === route || urlPath.startsWith(route + "/") || urlPath.startsWith(route + "?")) {
      const filePath = path.join(MOCK_DIR, `${file}.json`);
      if (fs.existsSync(filePath)) return filePath;
    }
  }
  return null;
}

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        const authHeader = (req.headers["authorization"] || "") as string;
        const hasValidAuth = authHeader.startsWith("Bearer ") && authHeader.replace("Bearer ", "").trim().length > 10 && authHeader.indexOf("null") === -1;
        if (hasValidAuth) { next(); return; }

        const mockFile = findMockFile(url);
        if (!mockFile) { next(); return; }

        const json = fs.readFileSync(mockFile, "utf-8");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.statusCode = 200;
        res.end(json);
      });
    },
  };
}
