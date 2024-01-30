<template>
  <header class="bg-white header-lower flex items-center p-5 shadow-lg z-50">
    <div class="logo">
      <NuxtLink to="/">
        <img
          src="@/assets/images/logostyles/logo-wide.svg"
          alt="Garibaldi Pharmacy and Compounding Lab logo"
        />
      </NuxtLink>
    </div>

    <nav class="flex items-center ml-auto">
      <ul class="header-links ml-auto font-light text-primary-900 flex gap-5">
        <!-- <li><NuxtLink to="/about">About</NuxtLink></li> -->
        <!-- <li><NuxtLink to="/blog">Blog</NuxtLink></li> -->
        <!-- <li><NuxtLink to="/compounding">Compounding</NuxtLink></li> -->
        <!-- <li><NuxtLink to="/services">Pharmacy Services</NuxtLink></li> -->
        <!-- <li>
          <NuxtLink to="/health-and-wellness">Home Health & Wellness</NuxtLink>
        </li> -->
      </ul>

      <div class="ml-5">
        <NuxtLink
          to="/contact"
          class="p-3 px-5 rounded-full text-white font-normal bg-primary-900 hover:opacity-90 transition-all hover:scale-105 block"
          >Contact</NuxtLink
        >
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup></script>
