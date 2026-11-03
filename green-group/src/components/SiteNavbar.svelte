
<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
  } from "components/ui/navigation-menu";

  const links = [
    { label: "Work", href: "/work" },
    { label: "Creative", href: "/creative" },
    { label: "Personal", href: "/personal" },
    { label: "About", href: "/about" },
  ];
</script>

<header class="w-full border-b border-border">
  <nav
    class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
    aria-label="Main navigation"
  >
    <a
      href="/"
      class="text-xl font-semibold tracking-tight"
      aria-label="Home"
    >
      YOUR LOGO
    </a>

    <NavigationMenu>
      <NavigationMenuList class="gap-2">
        {#each links as link}
          <NavigationMenuItem>
            <NavigationMenuLink
              href={link.href}
              class="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              {link.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        {/each}
      </NavigationMenuList>
    </NavigationMenu>
  </nav>
</header>
