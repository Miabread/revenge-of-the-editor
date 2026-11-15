<script setup lang="ts">
defineProps<{
    active?: boolean;
}>();
</script>
<template>
    <button
        :class="[
            'border-4 border-black px-4 py-1.5 tracking-wider text-black cursor-pointer grid place-items-center text-center select-none',
            'disabled:opacity-50 disabled:pointer-events-none',
            active
                ? 'bg-amber-400 translate-x-0.5 translate-y-0.5 shadow-[2px_2px_0px_#000]'
                : 'bg-stone-50 shadow-[4px_4px_0px_#000] hover:bg-yellow-300 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000]',
        ]"
    >
        <slot />
    </button>
</template>
