<script setup lang="ts">
import { Canvas, PencilBrush } from 'fabric';
import { ref, onMounted, onUnmounted } from 'vue';
import Button from './Button.vue';

const canvasHeight = 575;
const canvasWidth = Math.floor(canvasHeight * (16 / 9));

const canvasElement = ref(undefined);
let canvas: Canvas | null = null;

const saveAsImage = () => {
    if (!canvas) return;

    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = 'image.png';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

onMounted(() => {
    canvas = new Canvas(canvasElement.value, {
        backgroundColor: '#ffffff',
        isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#0055ff';
    canvas.freeDrawingBrush.width = 5;
});

onUnmounted(() => {
    if (!canvas) return;
    canvas.dispose();
    canvas = null;
});
</script>

<template>
    <aside id="panel-palette" class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll">
        <Button @click="saveAsImage">Save as Image</Button>
        <div class="grid grid-cols-2 gap-3">meow</div>
    </aside>

    <main class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center">
        <canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight" class="border border-gray-600"></canvas>
    </main>
</template>
