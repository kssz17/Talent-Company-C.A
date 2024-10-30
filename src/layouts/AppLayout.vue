<script setup lang="ts">
import AppTopNav from '@/components/layout/AppTopNav.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50">
    <AppTopNav />
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-screen-xl mx-auto px-6 py-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>
