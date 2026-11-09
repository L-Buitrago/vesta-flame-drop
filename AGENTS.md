<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Fetch the full Shopify catalog through cursor pagination and use the same query in collection, search, and recommendations; a page size must not hide newer products from category filters.
- Render only real Shopify products; empty catalogs never fall back to generated products.
- Gate every Meta browser event through the shared advertising-consent provider; explicit refusal and Global Privacy Control must stop transmission immediately.
