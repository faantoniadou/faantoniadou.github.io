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
    blur = 6,
    tint = 0.5,
    fallbackTint = 0.35,
    tintColor="color-mix(in oklab, var(--background) 96%, white)",
    saturate = 1,
    brightness = 1,
    class: className = "",
    children,
  }: {
    radius?: number;
    bevelDepth?: number;
    scale?: number;
    aberration?: number;
    frost?: number;
    blur?: number;
    tint?: number;
    fallbackTint?: number;
    tintColor?: string;
    saturate?: number;
    brightness?: number;
    class?: string;
    children?: Snippet;
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
    filter = {
      id,
      svg: buildFilterSvg({ id, mapUrl, width: w, height: h, scale, aberration, frost }),
    };
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
        ? `blur(${blur * 2}px) saturate(${saturate})`
        : filter
          ? `url(#${filter.id}) blur(${blur}px) saturate(${saturate}) brightness(${brightness})`
          : `blur(${blur * 2}px) saturate(${saturate}) brightness(${brightness})`
  );

  const bg = $derived(
    mode === "opaque"
      ? undefined
      : `color-mix(in oklab, ${tintColor} ${(mode === "simple" ? fallbackTint : tint) * 100}%, transparent)`
  );
</script>

<div
  bind:this={root}
  class={cn("relative overflow-hidden", mode === "opaque" && "bg-background", className)}
  style:border-radius="{radius}px"
  style:background-color={bg}
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