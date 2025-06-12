<script setup lang="ts">
import { supabase } from "@/config/db";
</script>

<template>
  <h1 class="text-3xl font-medium">Home</h1>
  <pre>{{ supabase.auth.user() }}</pre>
</template>
