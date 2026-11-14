<script setup lang="ts">
import { Canvas, FabricImage } from 'fabric';
import { ref, onMounted, onUnmounted } from 'vue';

const canvasBounds = {
    width: 600,
    height: 850,
};

const canvasElement = ref(undefined);
let canvas: Canvas | null = null;

const panelPieces = ref([{ url: '/panels/triangle.png' }, { url: '/panels/triangle.png' }]);

const spawnPanelPiece = async (imageUrl: string, dropPoint: { x: number; y: number }) => {
    if (!canvas) return;

    const image = await FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
    });

    if (image.width > canvasBounds.width / 2) {
        image.scaleToWidth(canvasBounds.width / 2);
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
    <div class="flex gap-5">
        <aside id="panel-palette" class="flex w-40 flex-col gap-3">
            <img
                v-for="panel in panelPieces"
                :key="panel.url"
                draggable="true"
                @dragstart="handlePalettePickup($event, panel.url)"
                :src="panel.url"
                style="width: 100%; cursor: grab; border: 1px solid #ccc"
            />
        </aside>

        <main @dragover.prevent="$event.dataTransfer!.dropEffect = 'copy'" @drop.prevent="handlePaletteDrop($event)">
            <canvas
                ref="canvasElement"
                :width="canvasBounds.width"
                :height="canvasBounds.height"
                class="border border-gray-400"
            ></canvas>
        </main>
    </div>
</template>
