import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), "src/data/mock");

const ROUTE_MAP: Record<string, string> = {
  "/api/v1/tables":               "tables",
  "/api/v1/waiters":              "waiters",
  "/api/v1/orders":               "orders",
  "/api/v1/menu-items":           "menu-items",
  "/api/v1/home-dashboard":       "home-dashboard",
  "/api/v1/delivery-executives":  "delivery-executives",
  "/api/v1/restaurant-roles":     "restaurant-roles",
  "/api/v1/getstaffs":            "getstaffs",
  "/api/v1/orderstatus":          "orderstatus",
  "/api/v1/branch-master-data":   "branch-master-data",
  "/api/v1/gettaxlist":           "gettaxlist",
  "/api/v1/get-menu":             "get-menu",
  "/api/v1/getcategory":          "getcategory",
  "/api/v1/branch-open-close":    "branch-open-close",
  "/api/v1/toggle-app-stock":     "toggle-app-stock",
  "/api/v1/get-reservations":     "get-reservations",
  "/api/v1/save-reservation":     "save-reservation",
};

function findMockFile(urlPath: string): string | null {
  const cleanPath = urlPath.split("?")[0];
  for (const [route, file] of Object.entries(ROUTE_MAP)) {
    if (cleanPath === route || cleanPath.startsWith(route + "/")) {
      const filePath = path.join(MOCK_DIR, `${file}.json`);
      if (fs.existsSync(filePath)) return filePath;
    }
  }
  return null;
}

function isValidToken(authHeader: string): boolean {
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  return token.length > 10 && token !== "null" && token !== "undefined";
}

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/v1/")) { next(); return; }

        const authHeader = (req.headers["authorization"] || "") as string;
        if (isValidToken(authHeader)) { next(); return; }

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
