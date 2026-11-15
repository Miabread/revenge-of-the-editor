<script setup lang="ts">
import { ref } from 'vue';
import Button from './Button.vue';
import { useCanvas } from './canvas.ts';

const { saveAsImage, width, height, onCanvasDragOver, onCanvasDrop, onPanelDragStart } = useCanvas();

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
        <Button @click="saveAsImage">Save as Image</Button>
        <div class="grid grid-cols-2 gap-3">
            <img
                v-for="panel in panelPieces"
                :key="panel.url"
                draggable="true"
                @dragstart="onPanelDragStart($event, panel.url)"
                :src="panel.url"
                class="width-full cursor-grab border border-gray-600"
            />
        </div>
    </aside>

    <main
        @dragover.prevent="onCanvasDragOver"
        @drop.prevent="onCanvasDrop"
        class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center"
    >
        <canvas ref="canvas-element" :width="width" :height="height" class="border border-gray-600"></canvas>
    </main>
</template>
