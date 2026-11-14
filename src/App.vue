<script setup lang="ts">
import { ref } from 'vue';
import PanelEditor from './PanelEditor.vue';
import DoodleEditor from './DoodleEditor.vue';
import Button from './Button.vue';

const activeTab = ref(0);
const tabs = ['Panel Phase', 'Doodle Phase'];
</script>

<template>
    <div class="special-background h-screen w-screen overflow-hidden grid grid-cols-[1fr_3fr] grid-rows-[75px_1fr]">
        <header class="col-span-2 bg-stone-50 border-4 border-black m-2 p-2 flex gap-3">
            <Button v-for="(tab, index) in tabs" :key="tab" :active="activeTab === index" @click="activeTab = index">
                {{ tab }}
            </Button>
        </header>
        <PanelEditor v-if="activeTab === 0" />
        <DoodleEditor v-else-if="activeTab === 1" />
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
