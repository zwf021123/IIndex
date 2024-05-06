<template>
  <yu-terminal
    ref="terminalRef"
    :user="loginUser"
    full-screen
    :on-submit-command="onSubmitCommand"
  />
</template>

<script setup lang="ts">
import { doCommandExecute } from "../core/commandExecutor";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores";
import { storeToRefs } from "pinia";
import { troggerExecuteUpdate } from "@/stores/modules/space";

const terminalRef = ref();

/**
 * @param inputText 输入的命令
 */
const onSubmitCommand = async (inputText: string) => {
  if (!inputText) {
    return;
  }
  const terminal = terminalRef.value.terminal;
  // 解析命令
  await doCommandExecute(inputText, terminal);
};

// 获取用户信息
const userStore = useUserStore();
const { loginUser } = storeToRefs(userStore);

onMounted(() => {
  troggerExecuteUpdate();
  userStore.getAndSetLoginUser();
});
</script>

<style></style>
