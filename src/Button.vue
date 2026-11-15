<script setup lang="ts">
defineProps<{
    active?: boolean;
}>();
</script>

<template>
    <button
        :class="[
            'border bg-stone-50 border-gray-600 px-4 active:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
            active ? 'bg-gray-300 font-semibold' : 'hover:bg-gray-200',
        ]"
    >
        <slot />
    </button>
</template>
