<script lang="ts">
  import { onMount } from "svelte";
  import { cn } from "$lib/utils";
  import LiquidGlass from "./LiquidGlass.svelte";

  let { sections }: { sections: { id: string; label: string }[] } = $props();

  let active = $state(sections[0]?.id ?? "");
  let pill = $state({ left: 0, width: 0 });
  let linkEls: HTMLAnchorElement[] = [];

  function measure(id: string) {
    const el = linkEls[sections.findIndex((s) => s.id === id)];
    if (el) pill = { left: el.offsetLeft, width: el.offsetWidth };
  }

  $effect(() => measure(active));

  onMount(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (active = e.target.id)),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    const onScroll = () => {
      if (innerHeight + scrollY >= document.body.scrollHeight - 4) {
        active = sections[sections.length - 1].id;
      }
    };
    const onResize = () => measure(active);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize); // re-measure once fonts load

    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
    };
  });
</script>

<nav aria-label="Page sections">
  <LiquidGlass
    aberration={3}
    frost={0.2}
    tint={0.5}
    fallbackTint={0.3}
    blur={3}
    scale={30}
    bevelDepth={100}
    class="shadow-[0_1px_9px_rgb(0_0_0/0.10),0_0_0_1px_rgb(0_0_0/0.04),inset_0_1px_0_rgb(255_255_255/0.3)]"
  >
    <div class="relative flex p-1">
      <span
        aria-hidden="true"
        class="absolute top-1 bottom-1 left-0 rounded-full bg-foreground/[0.07] motion-reduce:transition-none"
        style="width:{pill.width}px; transform:translateX({pill.left}px); opacity:{pill.width ? 1 : 0}; transition: transform 0.4s cubic-bezier(0.3,1.25,0.4,1), width 0.4s cubic-bezier(0.3,1.25,0.4,1), opacity 0.2s;"
      ></span>

      {#each sections as s, i}
        <a
          bind:this={linkEls[i]}
          href="#{s.id}"
          aria-current={active === s.id ? "true" : undefined}
          class={cn(
            "relative z-10 rounded-full px-4 py-2 text-sm transition-colors duration-200",
            active === s.id ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {s.label}
        </a>
      {/each}
    </div>
  </LiquidGlass>
</nav>