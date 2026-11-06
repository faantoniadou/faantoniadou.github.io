<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import Menu from "@lucide/svelte/icons/menu";

  let { currentPath }: { currentPath: string } = $props();

  const links = [
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/writing", label: "Writing" },
    { href: "/contact", label: "Contact" },
  ];

  let open = $state(false);
  const isActive = (href: string) => currentPath.startsWith(href);
</script>

<header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
    <!-- Site name: the main place your personality shows -->
    <a href="/" class="text-xl tracking-tight">Faidra Antoniadou</a>

    <!-- Desktop nav -->
    <nav class="hidden items-center gap-8 md:flex">
      {#each links as link}
        <a
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          class={cn(
            "text-sm text-muted-foreground transition-colors hover:text-foreground",
            isActive(link.href) &&
              "text-foreground underline decoration-2 underline-offset-8"
          )}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Mobile nav -->
    <Sheet.Root bind:open>
      <Sheet.Trigger
        class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
        aria-label="Open menu"
      >
        <Menu class="h-5 w-5" />
      </Sheet.Trigger>
      <Sheet.Content side="right" class="w-64">
        <Sheet.Title class="sr-only">Navigation</Sheet.Title>
        <nav class="mt-10 flex flex-col gap-6 font-serif text-2xl">
          {#each links as link}
            <a
              href={link.href}
              onclick={() => (open = false)}
              class={isActive(link.href) ? "text-foreground" : "text-muted-foreground"}
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</header>