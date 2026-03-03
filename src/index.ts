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

    "/occt-import-js.wasm": async () => {
      return new Response(Bun.file("public/occt-import-js.wasm"));
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
