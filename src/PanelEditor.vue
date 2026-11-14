<script setup lang="ts">
import { Canvas, FabricImage } from 'fabric';
import { ref, onMounted, onUnmounted } from 'vue';

const canvasHeight = 575;
const canvasWidth = Math.floor(canvasHeight * (16 / 9));

const canvasElement = ref(undefined);
let canvas: Canvas | null = null;

const panelPieces = ref([
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
    { url: '/panels/triangle.png' },
]);

const spawnPanelPiece = async (imageUrl: string, dropPoint: { x: number; y: number }) => {
    if (!canvas) return;

    const image = await FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
    });

    if (image.width > canvasWidth / 2) {
        image.scaleToWidth(canvasWidth / 2);
    }

    if (image.height > canvasHeight / 2) {
        image.scaleToHeight(canvasHeight / 2);
    }

    image.set({
        left: dropPoint.x,
        top: dropPoint.y,
        originX: 'center',
        originY: 'center',
        perPixelTargetFind: true,
        targetFindTolerance: 4,
        cornerColor: '#2563eb',
        cornerStyle: 'circle',
        borderColor: '#2563eb',
        transparentCorners: false,
        snapAngle: 15,
    });

    canvas.add(image);
    canvas.setActiveObject(image);
    canvas.requestRenderAll();
};

const handlePalettePickup = (e: DragEvent, panelUrl: string) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('text/plain', panelUrl);
    e.dataTransfer.effectAllowed = 'copy';
};

const handlePaletteDrop = async (e: DragEvent) => {
    const imageUrl = e.dataTransfer?.getData('text/plain');
    if (!imageUrl || !canvas) return;

    const pointer = canvas.getScenePoint(e);
    await spawnPanelPiece(imageUrl, pointer);
};

const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (!canvas) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    }
};

const saveAsImage = () => {
    if (!canvas) return;

    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = 'image.png';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

onMounted(() => {
    canvas = new Canvas(canvasElement.value, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
    });

    window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeyDown);

    if (!canvas) return;
    canvas.dispose();
    canvas = null;
});
</script>

<template>
    <aside id="panel-palette" class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll">
        <button @click="saveAsImage" class="border border-gray-600">Save as Image</button>
        <div class="grid grid-cols-2 gap-3">
            <img
                v-for="panel in panelPieces"
                :key="panel.url"
                draggable="true"
                @dragstart="handlePalettePickup($event, panel.url)"
                :src="panel.url"
                class="width-full cursor-grab border border-gray-600"
            />
        </div>
    </aside>

    <main
        @dragover.prevent="$event.dataTransfer!.dropEffect = 'copy'"
        @drop.prevent="handlePaletteDrop($event)"
        class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center"
    >
        <canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight" class="border border-gray-600"></canvas>
    </main>
</template>
