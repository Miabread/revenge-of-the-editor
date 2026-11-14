<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as fabric from 'fabric';

const canvasEl = ref(undefined);
let canvas: fabric.Canvas | null = null;

const panelPieces = ref([{ url: '/panels/triangle.png' }, { url: '/panels/triangle.png' }]);

async function importPanelPiece(imageUrl: string, dropPoint: { x: number; y: number }) {
    if (!canvas) return;

    const img = await fabric.FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
    });

    if (img.width > 300) {
        img.scaleToWidth(260);
    }

    img.set({
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

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
}

function handleDragStart(e: DragEvent, panelUrl: string) {
    e.dataTransfer!.setData('text/plain', panelUrl);
    e.dataTransfer!.effectAllowed = 'copy';
}

async function handleDrop(e: DragEvent) {
    const imageUrl = e.dataTransfer?.getData('text/plain');
    if (!imageUrl || !canvas) return;

    const pointer = canvas.getScenePoint(e);
    await importPanelPiece(imageUrl, pointer);
}

function handleKeyDown(e: KeyboardEvent) {
    if (!canvas) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && 'isEditing' in active && !active.isEditing) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    }
}

onMounted(() => {
    canvas = new fabric.Canvas(canvasEl.value, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
    });

    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    if (!canvas) return;
    canvas.dispose();
    canvas = null;
});
</script>

<template>
    <div class="editor-layout" style="display: flex; gap: 20px">
        <aside id="panel-palette" style="width: 160px; display: flex; flex-direction: column; gap: 12px">
            <img
                v-for="panel in panelPieces"
                :key="panel.url"
                draggable="true"
                @dragstart="handleDragStart($event, panel.url)"
                :src="panel.url"
                style="width: 100%; cursor: grab; border: 1px solid #ccc"
            />
        </aside>

        <main @dragover.prevent="$event.dataTransfer!.dropEffect = 'copy'" @drop.prevent="handleDrop($event)">
            <canvas ref="canvasEl" width="600" height="850" style="border: 1px solid #999"></canvas>
        </main>
    </div>
</template>
