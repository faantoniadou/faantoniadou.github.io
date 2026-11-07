<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import Menu from "@lucide/svelte/icons/menu";

  let { currentPath }: { currentPath: string } = $props();

  const links = [
    { href: "/professional", label: "Professional" },
    { href: "/case-studies", label: "Case Studies" },
    // { href: "/visual", label: "Visual" },
    // { href: "/personal", label: "Personal" }
  ];

  let open = $state(false);
  const isActive = (href: string) => currentPath.startsWith(href);
</script>
<header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
    <a href="/">
      <img src="/assets/logo.png" alt="Logo" class="h-10" />
    </a>
    <nav class="hidden items-center gap-8 md:flex">
      {#each links as link}
        <a
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          class="link-underline text-sm text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground"
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
    
      <Sheet.Content
        side="right"
        class="bg-background p-8 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-sm"
      >
        <Sheet.Title class="sr-only">Navigation</Sheet.Title>
    
        <nav class="mt-16 flex flex-col gap-6 font-display text-4xl">
          {#each links as link, i}
            <a
              href={link.href}
              onclick={() => (open = false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              class={cn(
                "reveal link-underline w-fit",
                isActive(link.href) ? "text-foreground" : "text-muted-foreground"
              )}
              style="--i:{i}"
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</header>