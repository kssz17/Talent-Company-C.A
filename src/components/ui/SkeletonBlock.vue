<script setup lang="ts">
defineProps<{
  /** Tailwind width class or inline value  */
  width?:  string
  /** Tailwind height class or inline value */
  height?: string
  /** border-radius override */
  rounded?: string
}>()
</script>

<template>
  <div
    class="skeleton"
    :style="{
      width:        width  ?? '100%',
      height:       height ?? '1rem',
      borderRadius: rounded ?? '0.375rem',
    }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.09) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes shimmer {
  0%   { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}
</style>
