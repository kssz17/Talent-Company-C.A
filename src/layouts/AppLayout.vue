<script setup lang="ts">
import AppSidebar from '@/components/layout/AppTopNav.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background:var(--bg);">

    <!-- ── Sidebar ────────────────────────────────────────────── -->
    <AppSidebar />

    <!-- ── Content ────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-screen-xl mx-auto px-8 py-7">
          <RouterView />
        </div>
      </main>
    </div>

  </div>
</template>
