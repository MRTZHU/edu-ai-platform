<script setup lang="ts">
import { supabase } from "@/config/db";
import { User } from "@supabase/supabase-js";

const user = supabase.auth.user() as User;
const metadata = user.user_metadata;
const name = ref(metadata?.nickname || user.email);

const password = ref("");
const nickname = ref(name.value);

const loading = ref(false);

/* Change Password */
async function changePassword() {
  loading.value = true;
  const { error } = await supabase.auth.update({
    password: password.value,
  });
  alert(error?.message || "password successfully changed");
  password.value = "";
  loading.value = false;
}

/* Change Nickname */
async function changeNickname() {
  loading.value = true;
  const { error } = await supabase.auth.update({
    data: { nickname: nickname.value },
  });
  if (error) alert(error.message);
  else {
    alert("nickname successfully changed");
    name.value = nickname.value;
  }
  loading.value = false;
}
</script>

<template>
  <h1 class="mb-2 text-3xl font-medium">Profile</h1>
  <p class="mb-4 text-xl">Hi, {{ name }}</p>

  <div class="inline-grid grid-cols-1 gap-8 md:grid-cols-2">
    <form
      class="inline-flex flex-col space-y-2"
      @submit.prevent="changePassword"
    >
      <VLabel for="password">Change your password</VLabel>
      <VPasswordInput
        :disabled="loading"
        v-model="password"
        class="inline-block"
        name="password"
        id="password"
        placeholder="Choose a new password"
      />
      <VButton :disabled="loading" class="bg-teal-700">Change Password</VButton>
    </form>
    <form
      class="inline-flex flex-col space-y-2"
      @submit.prevent="changeNickname"
    >
      <VLabel for="nickname">Change your nickname</VLabel>
      <VInput
        :disabled="loading"
        required
        v-model="nickname"
        class="inline-block"
        name="nickname"
        id="nickname"
        placeholder="Choose a new nickname"
      />
      <VButton :disabled="loading" class="bg-teal-700">Change Nickname</VButton>
    </form>
  </div>
</template>
