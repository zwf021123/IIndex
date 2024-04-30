<template>
  <div>
    <iframe
      class="main"
      frameborder="no"
      marginwidth="0"
      marginheight="0"
      :src="videoPath"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";

interface MusicBoxProps {
  bvid: string;
}

const props = withDefaults(defineProps<MusicBoxProps>(), {});
const { bvid } = toRefs(props);

const videoPath = computed(() => {
  return `https://player.bilibili.com/player.html?bvid=${bvid.value}`;
});
</script>

<style scoped>
.main {
  width: 100%;
  height: 80vh;
  min-height: 600px;
  overflow: hidden;
}
</style>
