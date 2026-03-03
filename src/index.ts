import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/occt-import-js.wasm": {
      async GET(req) {
        console.log("[Server] Request for /occt-import-js.wasm");
        try {
          const wasmPath = Bun.resolveSync(
            "occt-import-js/dist/occt-import-js.wasm",
            import.meta.dir,
          );
          console.log("[Server] Resolved WASM path:", wasmPath);
          const file = Bun.file(wasmPath);
          if (!(await file.exists())) {
            console.error("[Server] WASM file not found on disk:", wasmPath);
            return new Response("WASM file not found", { status: 404 });
          }
          return new Response(file);
        } catch (error) {
          console.error("[Server] Error resolving WASM:", error);
          // Fallback to absolute path if resolveSync fails
          const fallbackPath =
            "node_modules/occt-import-js/dist/occt-import-js.wasm";
          console.log("[Server] Trying fallback path:", fallbackPath);
          const fallbackFile = Bun.file(fallbackPath);
          if (await fallbackFile.exists()) {
            return new Response(fallbackFile);
          }
          return new Response(String(error), { status: 500 });
        }
      },
    },

    "/api/analyze": {
      async POST(req) {
        try {
          const body = await req.formData();
          const res = await fetch(
            "https://dfm-service-4xf0.onrender.com/analyze",
            {
              method: "POST",
              body: body,
            },
          );

          if (!res.ok) {
            return new Response(res.statusText, { status: res.status });
          }

          const data = await res.json();
          return Response.json(data);
        } catch (error) {
          return new Response(String(error), { status: 500 });
        }
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
