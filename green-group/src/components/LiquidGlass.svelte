<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { cn } from "$lib/utils";
  import { makeDisplacementUrl, buildFilterSvg } from "$lib/liquid-glass";

let {
  radius = 999,
  bevelDepth = 10,
  scale = 28,
  aberration = 2,
  frost = 0.4,
  blur = 6,          // new: px of blur applied to whatever is behind the glass
  tint = 0.5,
  fallbackTint = 0.35,
  class: className = "",
  children,
}: {
  radius?: number; bevelDepth?: number; scale?: number; aberration?: number;
  frost?: number; blur?: number; tint?: number; class?: string; children?: Snippet;
  tint?: number; fallbackTint?: number;
} = $props();

  let root: HTMLDivElement;
  let mode = $state<"pending" | "simple" | "opaque">("pending");
  let filter = $state<{ id: string; svg: string } | null>(null);
  let blobUrl: string | null = null;
  let token = 0;
  const uid = Math.random().toString(36).slice(2, 8);

  async function rebuild(w: number, h: number) {
    const mine = ++token;
    const mapUrl = await makeDisplacementUrl({
      width: w,
      height: h,
      radius: Math.min(radius, w / 2, h / 2),
      bevelDepth: Math.min(bevelDepth, Math.min(w, h) / 2),
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    if (mine !== token) return URL.revokeObjectURL(mapUrl); // a newer build won
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = mapUrl;
    const id = `lg-${uid}-${w}x${h}-${Date.now().toString(36)}`; // new id: browsers cache by id
    filter = { id, svg: buildFilterSvg({ id, mapUrl, width: w, height: h, scale, aberration, frost }) };
  }

  onMount(() => {
    if (matchMedia("(prefers-reduced-transparency: reduce)").matches) {
      mode = "opaque";
      return;
    }
    const ua = navigator.userAgent;
    const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
    const supported = CSS.supports("backdrop-filter", "url(#x)");
    if (safari || !supported) {
      mode = "simple";
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize?.[0];
      const w = Math.round(box?.inlineSize ?? entry.contentRect.width);
      const h = Math.round(box?.blockSize ?? entry.contentRect.height);
      if (w > 1 && h > 1) rebuild(w, h);
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  });

  const backdrop = $derived(
    mode === "opaque"
      ? "none"
      : mode === "simple"
        ? `blur(${blur * 2}px) saturate(1.4)`
        : filter
          ? `url(#${filter.id}) blur(${blur}px) saturate(1.85) brightness(0.82)`
          : `blur(${blur * 2}px) saturate(1.6) brightness(1.04)`
  );
</script>

<div
  bind:this={root}
  class={cn(
      "relative overflow-hidden",
      mode === "opaque" && "bg-background",
      className
    )}
    style:border-radius="{radius}px"
    style:background-color={mode === "opaque"
      ? undefined
      : `rgb(255 255 255 / ${mode === "simple" ? fallbackTint : tint})`}
    style:backdrop-filter={backdrop}
    style:-webkit-backdrop-filter={backdrop}
>
  {#if filter}
    {#key filter.id}
      <span aria-hidden="true" class="pointer-events-none absolute size-0 overflow-hidden">
        {@html filter.svg}
      </span>
    {/key}
  {/if}
  {@render children?.()}
</div>