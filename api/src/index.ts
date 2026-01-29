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

app.post("/callback", async (c) => {
  // 1. Next.jsからcodeを受け取る
  const { code } = await c.req.json();

  // 2. Spotify APIにトークンをリクエスト
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(c.env.SPOTIFY_CLIENT_ID + ":" + c.env.SPOTIFY_CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: c.env.SPOTIFY_REDIRECT_URL,
    }),
  });

  const tokenData = (await tokenResponse.json()) as any;

  // 3. トークンを使ってユーザー情報を取得
  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData = (await userResponse.json()) as any;

  // 4. Next.jsに返す
  return c.json({
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    spotifyUserId: userData.id,
    email: userData.email,
  });
});

export default app;
