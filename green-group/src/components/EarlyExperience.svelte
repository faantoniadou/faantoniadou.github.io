<script lang="ts">
  import * as Collapsible from "$lib/components/ui/collapsible";
  import { slide } from "svelte/transition";
  import { cn } from "$lib/utils";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  const items = [
    {
      role: "Operations Intern",
      org: "Amazon",
      dates: "Jun – Aug 2021",
      line: "Automated a manual process with a tool built in Excel (VBA, JavaScript), trialling it with users and iterating on their feedback until 80% found it beneficial.",
    },
    {
      role: "Research Intern",
      org: "University of Cyprus",
      dates: "Jun – Dec 2020",
      line: "Supervised by a professor and PhD student in the development of a research project as a Student-Led, Individually-Created Course.",
    },
  ];

  let open = $state(false);

  type Item = { role: string; org: string; dates: string; line: string };
</script>
<Collapsible.Root bind:open class="border-t border-border/60">
  <Collapsible.Trigger
    class="flex w-full items-center justify-between py-5 text-left font-display text-xl transition-colors hover:text-link active:text-link focus-visible:text-link cursor-pointer"
  >
    <span>
      Earlier experience
      <span class="ml-2 text-sm text-muted-foreground">({items.length})</span>
    </span>
    <ChevronDown
      class={cn("h-5 w-5 transition-transform duration-300", open && "rotate-180")}
      aria-hidden="true"
    />
  </Collapsible.Trigger>

  <Collapsible.Content forceMount>
    {#snippet child({ props })}
      {#if open}
        <ul {...props} transition:slide={{ duration: 300 }} class="space-y-6 pb-8">
          {#each items as e}
            <li class="grid gap-1 md:grid-cols-[8rem_1fr] md:gap-10">
              <p class="text-sm text-muted-foreground">{e.dates}</p>
              <div>
                <p class="font-display text-lg">{e.role}, {e.org}</p>
                <p class="text-muted-foreground">{e.line}</p>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    {/snippet}
  </Collapsible.Content>
</Collapsible.Root>

<!-- the rest of the markup stays exactly as before -->