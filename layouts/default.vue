<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main>
      <slot />
    </main>
    <Footer class="mt-auto" />
  </div>
</template>

<script lang="ts" setup></script>
