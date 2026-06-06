<script setup lang="ts">
import AppSidebar     from '@/components/layout/AppTopNav.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import CommandPalette from '@/components/ui/CommandPalette.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background:var(--bg);">

    <!-- ── Sidebar ────────────────────────────────────────────── -->
    <AppSidebar />

    <!-- ── Content ────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-screen-xl mx-auto px-8 py-7">
          <RouterView v-slot="{ Component, route }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

  </div>

  <!-- ── Global toast notifications ────────────────────────── -->
  <ToastContainer />

  <!-- ── Command palette (Ctrl/Cmd+K) ──────────────────────── -->
  <CommandPalette />
</template>

<style>
/* Page transition — subtle fade + lift */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
