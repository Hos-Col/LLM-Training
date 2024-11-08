<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";

const chatStore = useChatStore();
const router = useRouter();

const status = ref<"login" | "register">("login");
</script>
<template>
  <div class="flex h-full w-full bg-blue justify-between items-center bg-blue-500">
    <div class="h-full w-1/2 flex items-center justify-center">
      <img src="../../assets/image/login/login_pic.png" class="w-[500px] h-[400px]">
    </div>
    <div class="h-full w-1/2 flex items-center justify-center bg-white rounded-l-[40px]">
      <div 
        class="flex flex-col items-center h-[450px] w-3/5 justify-between">
        <img src="../../assets/title1.png" class="w-[200px] mb-8">
        <Login 
          v-if="status === 'login'" 
          v-model:status="status" />
        <Register
          v-else-if="status === 'register'"
          v-model:status="status" />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
