# Italian Flash Card Review

A user-neutral review site for the Italian for Beginners Anki decks.

## Netlify setup

1. In Netlify, choose **Add new project → Import an existing project**.
2. Select `wolney8/italian-flash-card-review`.
3. Use:
   - **Production branch:** `main`
   - **Build command:** leave blank
   - **Publish directory:** `.`
4. Deploy the site.
5. In Netlify, open **Forms** and enable form detection.
6. Trigger one more deploy, then submit a test comment.

Comments are stored privately in:

`Netlify → Forms → card-review`

## Updating the review site

Update the files in this same repository and commit them to `main`. Netlify will redeploy automatically.

Existing form submissions remain in Netlify as long as the same Netlify project and the `card-review` form are kept.
