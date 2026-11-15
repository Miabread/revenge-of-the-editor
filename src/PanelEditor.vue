<script setup lang="ts">
import { ref } from 'vue';
import type { CanvasProps } from './canvas.ts';

interface Props {
    canvas: CanvasProps;
}

const { canvas } = defineProps<Props>();

canvas.brush.enabled = false;

const panelPieces = ref([
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
]);
</script>

<template>
    <aside id="panel-palette" class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll">
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
    </aside>
</template>
