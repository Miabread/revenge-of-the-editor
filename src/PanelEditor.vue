<script setup lang="ts">
import { ref } from 'vue';
import type { CanvasProps } from './canvas.ts';

interface Props {
    canvas: CanvasProps;
}

const { canvas } = defineProps<Props>();

canvas.brush.enabled = false;

const panelPieces = ref([
    { url: '/assets/panel/panel1.png' },
    { url: '/assets/panel/panel3.png' },
    { url: '/assets/panel/panel4.png' },
    { url: '/assets/panel/panel5.png' },
    { url: '/assets/bubble/bubble1.png' },
    { url: '/assets/bubble/bubble3.png' },
    { url: '/assets/bubble/bubble4.png' },
    { url: '/assets/bubble/bubble5.png' },
]);
</script>

<template>
    <div class="grid grid-cols-2 gap-3">
        <img
            v-for="panel in panelPieces"
            :key="panel.url"
            draggable="true"
            @dragstart="canvas.onPanelDragStart($event, panel.url)"
            :src="panel.url"
            class="width-full cursor-grab border border-gray-600"
        />
    </div>
</template>
