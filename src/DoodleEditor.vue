<script setup lang="ts">
import Button from './Button.vue';
import type { CanvasProps } from './canvas.ts';

interface Props {
    canvas: CanvasProps;
}

const { canvas } = defineProps<Props>();

canvas.brush.enabled = true;

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
    <div class="grid grid-cols-3 gap-3">
        <Button
            v-for="(button, i) in paletteButtons"
            :key="i"
            @click="(canvas.brush[button.key] as any) = button.value"
            :active="canvas.brush[button.key] === button.value"
            class="aspect-square"
        >
            <div
                v-if="button.key === 'color'"
                :style="{ backgroundColor: button.value }"
                class="aspect-square border w-full"
            ></div>
            {{ button.label }}
        </Button>
    </div>
</template>
