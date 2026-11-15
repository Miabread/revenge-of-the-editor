<script setup lang="ts">
import { onMounted } from 'vue';
import type { CanvasProps } from './canvas.ts';

interface Props {
    canvas: CanvasProps;
}

const { canvas } = defineProps<Props>();

onMounted(() => {
    canvas.brush.enabled = false;
    canvas.isDisabled.value = true;
});
</script>

<template>
    <div class="grid grid-cols-2 gap-3">mrow</div>
</template>
