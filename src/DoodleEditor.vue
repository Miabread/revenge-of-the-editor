<script setup lang="ts">
import { Canvas, getEnv, PatternBrush, PencilBrush } from 'fabric';
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue';
import Button from './Button.vue';

const canvasHeight = 500;
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

const brush = reactive({
    color: 'black',
    width: 20,
    style: 'solid' as 'solid' | 'dots' | 'lines',
});

const updateBrush = () => {
    if (!canvas) return;

    if (brush.style === 'solid') {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
    } else if (brush.style === 'dots') {
        canvas.freeDrawingBrush = new PatternBrush(canvas);
    } else if (brush.style === 'lines') {
        const patternBrush = new PatternBrush(canvas);

        patternBrush.getPatternSrc = function () {
            const patternCanvas = getEnv().document.createElement('canvas');
            patternCanvas.width = patternCanvas.height = 10;
            const ctx = patternCanvas.getContext('2d')!;

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.lineTo(10, 5);
            ctx.closePath();
            ctx.stroke();

            return patternCanvas;
        };

        canvas.freeDrawingBrush = patternBrush;
    }

    canvas.freeDrawingBrush!.color = brush.color;
    canvas.freeDrawingBrush!.width = brush.width;
};

onMounted(() => {
    canvas = new Canvas(canvasElement.value, {
        backgroundColor: '#ffffff',
        isDrawingMode: true,
    });

    updateBrush();

    watch(brush, () => {
        updateBrush();
    });
});

onUnmounted(() => {
    if (!canvas) return;
    canvas.dispose();
    canvas = null;
});
</script>

<template>
    <aside class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll">
        <Button @click="saveAsImage">Save as Image</Button>
        <div class="grid grid-cols-3 gap-3">
            <Button @click="brush.width = 5" class="aspect-square">Small</Button>
            <Button @click="brush.width = 20" class="aspect-square">Medium</Button>
            <Button @click="brush.width = 70" class="aspect-square">Large</Button>

            <Button @click="brush.style = 'solid'" class="aspect-square">Solid</Button>
            <Button @click="brush.style = 'dots'" class="aspect-square">Dots</Button>
            <Button @click="brush.style = 'lines'" class="aspect-square">Lines</Button>

            <Button @click="brush.color = 'black'" class="aspect-square bg-black"></Button>
            <Button @click="brush.color = 'white'" class="aspect-square bg-white"></Button>
            <Button @click="brush.color = 'grey'" class="aspect-square bg-gray-500"></Button>

            <Button @click="brush.color = 'red'" class="aspect-square bg-red-500"></Button>
            <Button @click="brush.color = 'orange'" class="aspect-square bg-orange-500"></Button>
            <Button @click="brush.color = 'yellow'" class="aspect-square bg-yellow-500"></Button>

            <Button @click="brush.color = 'green'" class="aspect-square bg-green-500"></Button>
            <Button @click="brush.color = 'blue'" class="aspect-square bg-blue-500"></Button>
            <Button @click="brush.color = 'purple'" class="aspect-square bg-purple-500"></Button>
        </div>
    </aside>

    <main class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center">
        <canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight" class="border border-gray-600"></canvas>
    </main>
</template>
