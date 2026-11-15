import { Canvas, FabricImage, getEnv, PatternBrush, PencilBrush } from 'fabric';
import { onMounted, onUnmounted, reactive, watch, useTemplateRef, ref } from 'vue';
import { EraserBrush } from '@erase2d/fabric';

export type CanvasProps = ReturnType<typeof useCanvas>;

export const useCanvas = () => {
    const height = 500;
    const width = Math.floor(height * (16 / 9));

    const canvasElement = useTemplateRef<HTMLCanvasElement>('canvas-element');

    let canvas: Canvas | null = null;
    onMounted(() => {
        canvas = new Canvas(canvasElement.value!, {
            backgroundColor: '#ffffff',
        });

        canvas.on('path:created', (e) => e.path.set('erasable', true));
    });
    onUnmounted(() => {
        if (!canvas) return;
        canvas.dispose();
        canvas = null;
    });

    const isDisabled = ref(false);

    const setDisabled = () => {
        if (!canvas) return;

        canvas.selection = !isDisabled.value;

        if (isDisabled.value) {
            canvas.discardActiveObject();
        }

        canvas.forEachObject((obj) => {
            obj.selectable = !isDisabled.value;
            obj.evented = !isDisabled.value;
        });

        canvas.requestRenderAll();
    };
    watch(isDisabled, setDisabled);

    const saveAsImage = () => {
        if (!canvas) return;

        const a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'image.png';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const brush = reactive({
        enabled: false,
        color: 'black',
        width: 20,
        style: 'solid' as 'solid' | 'dots' | 'lines' | 'eraser',
    });

    const onBrushUpdate = () => {
        if (!canvas) return;

        canvas.isDrawingMode = brush.enabled;

        if (brush.style === 'eraser') {
            const eraser = new EraserBrush(canvas);
            eraser.width = brush.width;
            canvas.freeDrawingBrush = eraser;
            return;
        }

        if (brush.style === 'solid') {
            canvas.freeDrawingBrush = new PencilBrush(canvas);
        } else if (brush.style === 'dots') {
            canvas.freeDrawingBrush = new PatternBrush(canvas);
        } else if (brush.style === 'lines') {
            const patternBrush = new PatternBrush(canvas);

            patternBrush.getPatternSrc = function () {
                const patternCanvas = getEnv().document.createElement('canvas');
                patternCanvas.width = patternCanvas.height = 10;
                const ctx = patternCanvas.getContext('2d')!;

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(0, 5);
                ctx.lineTo(10, 5);
                ctx.closePath();
                ctx.stroke();

                return patternCanvas;
            };

            canvas.freeDrawingBrush = patternBrush;
        }

        canvas.freeDrawingBrush!.color = brush.color;
        canvas.freeDrawingBrush!.width = brush.width;
    };
    onMounted(() => watch(brush, onBrushUpdate, { immediate: true }));

    const spawnPanelPiece = async (imageUrl: string, dropPoint: { x: number; y: number }) => {
        if (!canvas) return;

        const image = await FabricImage.fromURL(imageUrl, {
            crossOrigin: 'anonymous',
        });

        if (image.width > width / 2) {
            image.scaleToWidth(width / 2);
        }

        if (image.height > height / 2) {
            image.scaleToHeight(height / 2);
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
            erasable: false,
        });

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.requestRenderAll();
    };

    const onPanelDragStart = (e: DragEvent, panelUrl: string) => {
        if (!e.dataTransfer || isDisabled.value) return;
        e.dataTransfer.setData('text/plain', panelUrl);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const onCanvasDragOver = (e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'copy';
    };

    const onCanvasDrop = async (e: DragEvent) => {
        const imageUrl = e.dataTransfer?.getData('text/plain');
        if (!imageUrl || !canvas || isDisabled.value) return;

        const pointer = canvas.getScenePoint(e);
        await spawnPanelPiece(imageUrl, pointer);
    };

    const onGlobalKeyDown = (e: KeyboardEvent) => {
        if (!canvas || isDisabled.value) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const active = canvas.getActiveObject();
            if (active) {
                canvas.remove(active);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        }
    };
    onMounted(() => window.addEventListener('keydown', onGlobalKeyDown));
    onUnmounted(() => window.removeEventListener('keydown', onGlobalKeyDown));

    const setDataUrl = async (dataUrl: string) => {
        if (!canvas) return;

        canvas.clear();

        const image = await FabricImage.fromURL(dataUrl);

        image.set({
            originX: 'center',
            originY: 'center',
            left: width / 2,
            top: height / 2,
        });

        image.scale(Math.min(canvas.width / image.width, canvas.height / image.height));

        canvas.backgroundImage = image;
        canvas.requestRenderAll();
    };

    const getDataUrl = () => {
        if (!canvas) return;

        return canvas.toDataURL({
            format: 'webp',
            quality: 1,
            multiplier: 1,
        });
    };

    const clear = () => {
        if (!canvas) return;
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.requestRenderAll();
    };

    return {
        width,
        height,

        brush,
        isDisabled,

        saveAsImage,
        clear,

        setDataUrl,
        getDataUrl,

        onCanvasDragOver,
        onCanvasDrop,
        onPanelDragStart,
    };
};
