import { Hono } from "hono";

type Bindings = {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REDIRECT_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/login", (c) => {
  const Params = new URLSearchParams({
    response_type: "code",
    client_id: c.env.SPOTIFY_CLIENT_ID,
    scope: "user-read-private user-read-email",
    redirect_uri: c.env.SPOTIFY_REDIRECT_URL,
  });

  return c.redirect(`https://accounts.spotify.com/authorize?${Params}`);
});

export default app;
