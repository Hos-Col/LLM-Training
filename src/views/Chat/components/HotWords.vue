<script setup lang="ts">
import { ref } from "vue"
const words = ref(['慧舍实训', '人工智能', '智能语音', '大数据'])
</script>
<template>
 <div class="text-gray-700 text-xs lg:text-sm">
    <span>热词：</span>
    <span 
        v-for="item in words" :key="item" class="mr-2">
        {{ item }}
    </span>
</div>   
</template>