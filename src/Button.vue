<script setup lang="ts">
defineProps<{
    active?: boolean;
}>();
</script>

<template>
    <button
        :class="[
            'border border-gray-600 px-4 active:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer grid place-items-center text-center',
            active ? 'bg-gray-300' : 'hover:bg-gray-200 bg-stone-50',
        ]"
    >
        <slot />
    </button>
</template>
