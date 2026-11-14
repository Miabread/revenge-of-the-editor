<script setup lang="ts">
import PanelEditor from './PanelEditor.vue';
</script>

<template>
    <div class="special-background h-screen w-screen overflow-hidden grid grid-cols-[1fr_3fr] grid-rows-[75px_1fr]">
        <header class="col-span-2 bg-stone-50 border-4 border-black m-2 p-2">Header</header>
        <PanelEditor />
    </div>
</template>

<style scoped>
.special-background {
    background-image:
        radial-gradient(
            circle 5px at top left,
            rgba(226, 226, 226, 0.1) 0%,
            rgba(226, 226, 226, 0.1) 50%,
            rgba(201, 201, 201, 0.1) 50%,
            rgba(201, 201, 201, 0.1) 30%,
            transparent 30%,
            transparent 50%
        ),
        linear-gradient(90deg, rgb(51, 51, 51), rgb(51, 51, 51));
    background-size: 11px 11px;
}
</style>
