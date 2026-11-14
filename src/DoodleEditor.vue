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

const paletteButtons = [
    { key: 'width', value: 5, label: 'Small' },
    { key: 'width', value: 20, label: 'Medium' },
    { key: 'width', value: 70, label: 'Large' },
    { key: 'style', value: 'solid', label: 'Solid' },
    { key: 'style', value: 'dots', label: 'Dots' },
    { key: 'style', value: 'lines', label: 'Lines' },
    { key: 'color', value: 'black', label: '' },
    { key: 'color', value: 'white', label: '' },
    { key: 'color', value: 'grey', label: '' },
    { key: 'color', value: 'red', label: '' },
    { key: 'color', value: 'orange', label: '' },
    { key: 'color', value: 'yellow', label: '' },
    { key: 'color', value: 'green', label: '' },
    { key: 'color', value: 'blue', label: '' },
    { key: 'color', value: 'purple', label: '' },
] as const;
</script>

<template>
    <aside class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll">
        <Button @click="saveAsImage">Save as Image</Button>
        <div class="grid grid-cols-3 gap-3">
            <Button
                v-for="(button, i) in paletteButtons"
                :key="i"
                @click="(brush[button.key] as any) = button.value"
                :active="brush[button.key] === button.value"
                class="aspect-square grid place-items-center"
            >
                <div
                    v-if="button.key === 'color'"
                    :style="{ backgroundColor: button.value }"
                    class="aspect-square border w-full"
                ></div>
                {{ button.label }}
            </Button>
        </div>
    </aside>

    <main class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center">
        <canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight" class="border border-gray-600"></canvas>
    </main>
</template>
