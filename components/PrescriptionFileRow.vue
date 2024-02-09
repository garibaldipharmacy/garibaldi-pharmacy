<template>
  <div class="sm:flex-1">
    <label
      :for="`prescription-file-front-${index}`"
      class="block mb-2 text-sm font-medium text-gray-900"
      >Prescription {{ index }} (Front)
      <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
    /></label>
    <input
      type="file"
      :name="`prescription-file-front-${index}`"
      :id="`prescription-file-front-${index}`"
      accept="image/*,.pdf"
      class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
    />
  </div>
  <div class="sm:flex-1">
    <label
      :for="`prescription-file-back-${index}`"
      class="block mb-2 text-sm font-medium text-gray-900"
      >Prescription {{ index }} (Back)
      <Icon name="fa6-solid:asterisk" class="text-red-600 text-xs ml-1"
    /></label>
    <input
      type="file"
      :name="`prescription-file-back-${index}`"
      :id="`prescription-file-back-${index}`"
      accept="image/*,.pdf"
      class="font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-900 focus:border-primary-900 block w-full p-2.5"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  index: Number,
});
</script>

<style></style>
