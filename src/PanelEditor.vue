<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { CanvasProps } from './canvas.ts';

interface Props {
    canvas: CanvasProps;
}

const { canvas } = defineProps<Props>();

onMounted(() => {
    canvas.brush.enabled = false;
    canvas.isDisabled.value = false;
});

const panelPieces = ref([
    { url: '/assets/panel/panel1.png' },
    { url: '/assets/panel/panel2.png' },
    { url: '/assets/panel/panel3.png' },
    { url: '/assets/panel/panel4.png' },
    { url: '/assets/panel/cloud1.png' },
    { url: '/assets/panel/cloud2.png' },
    { url: '/assets/panel/sliced.png' },
    { url: '/assets/bubble/bubble1.png' },
    { url: '/assets/bubble/bubble2.png' },
    { url: '/assets/bubble/bubble3.png' },
    { url: '/assets/bubble/bubble4.png' },
    { url: '/assets/bubble/bubble5.png' },
    { url: '/assets/bubble/bubble6.png' },
    { url: '/assets/bubble/bubble7.png' },
]);
</script>

<template>
    <div class="grid grid-cols-2 gap-3 p-5 overflow-scroll h-full">
        <img
            v-for="panel in panelPieces"
            :key="panel.url"
            draggable="true"
            @dragstart="canvas.onPanelDragStart($event, panel.url)"
            :src="panel.url"
            class="width-full cursor-grab"
        />
    </div>
</template>
