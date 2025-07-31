<template>
  <div>
    <VitePwaManifest />
    <NuxtLoadingIndicator color="#e4e6ec" :throttle="0" :height="1" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style></style>
