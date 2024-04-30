<template>
  <div>
    <div v-for="(song, index) in songList" :key="index">
      <a-popover placement="right">
        <template #content>
          <img :src="song?.al?.picUrl" width="260" :alt="song?.al?.name" />
        </template>
        <img
          :src="song?.al?.picUrl"
          height="25"
          :alt="song?.al?.name"
          class="songCover"
        />
      </a-popover>
      <a :href="`https://music.163.com/#/song?id=${song?.id}`" target="_blank">
        {{ song?.al?.name }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
interface MusicBoxProps {
  songList: Array<any>;
}

const props = withDefaults(defineProps<MusicBoxProps>(), {});

const { songList } = toRefs(props);
</script>

<style scoped>
.songCover {
  cursor: zoom-in;
}
</style>
