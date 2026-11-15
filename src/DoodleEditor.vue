<script setup lang="ts">
import Button from './Button.vue';
import { useCanvas } from './canvas.ts';

const { saveAsImage, brush, width, height } = useCanvas();

brush.enabled = true;

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
        <canvas ref="canvas-element" :width="width" :height="height" class="border border-gray-600"></canvas>
    </main>
</template>
