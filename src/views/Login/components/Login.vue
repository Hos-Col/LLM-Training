<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat';
const chatStore = useChatStore();
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
import { useRouter } from 'vue-router'
import { postLogin } from '@/services/user';
import { ElMessage } from 'element-plus'

const router = useRouter()

const status = defineModel('status')

const loginData = ref({
    account: '',
    password: ''
})
const login = async () => {
    const result = await postLogin(loginData.value.account,loginData.value.password)
    if (result.code === 200) {
        userStore.setUser(
            result.account,
            result.username,
            result.type
        )
        // console.log(userStore.user);
        ElMessage({
            type: 'success',
            message: '登录成功',
            duration: 1000
        })
        setTimeout(() => {
            router.push('/index')
        }, 1000)
    } else {
        ElMessage({
            type: 'error',
            message: '账号或密码错误，请重新输入！'
        })
    }
}
</script>
<template>
    <span class="text-3xl w-full text-[#152c5b] font-extrabold ">Sign In</span>
    <el-form class="w-full">
        <el-form-item  class="w-full">
            <label class="text-[#152c5b] font-bold tracking-widest">账号：</label>
            <el-input v-model="loginData.account" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item class="w-full">
            <label class="text-[#152c5b] font-bold tracking-widest">密码：</label>
            <el-input v-model="loginData.password" type="password" placeholder="请输入登录密码" />
        </el-form-item>
    </el-form>
    <div class="flex justify-between w-full mb-4">
        <el-link class="text-xs" @click="status = 'register'">注册账号</el-link>
        <el-link class="text-xs">忘记密码？</el-link>
    </div>
    <el-button 
        class="w-full"
        :disabled="!loginData.account || !loginData.password" 
        color="#3b82f6" size="large" 
        @click="login">
        <span class="px-4 text-md">登录</span>
    </el-button>
</template>

<style scoped lang='scss'>
.el-form-item__label{
    font-size: 50px;
    color: #3b82f6 !important;
}
</style>