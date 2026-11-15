<script setup lang="ts">
import Button from './Button.vue';
import { paletteButtons, panelPieces, gameStateTitles, playerIcons, backgrounds } from './constants.ts';
import { useGame } from './game.ts';
import { useMusic } from './music.ts';

useMusic();

const {
    canvas,
    gameState,
    selectSubmission,
    selectedSubmission,
    submissions,
    sendReady,
    roomClient,
    selfReady,
    readyStatuses,
} = useGame();

const getPlayerIcon = (peerId: string) => {
    let hash = 2166136261;
    for (let i = 0; i < peerId.length; i++) {
        hash ^= peerId.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return playerIcons[(hash >>> 0) % playerIcons.length].url;
};
</script>

<template>
    <div class="special-background font-bangers h-dvh w-dvw overflow-hidden grid grid-cols-[1fr_3fr_1fr] grid-rows-1">
        <aside
            class="m-2 p-2 bg-center bg-no-repeat bg-size-[125%_100%] flex flex-col items-center"
            :style="{ backgroundImage: `url('${backgrounds.tin_left}')` }"
        >
            <a href="https://petalcreator.itch.io/revenge-of-the-editor" class="w-1/2 mb-5">
                <img :src="backgrounds.cover" class="border-3 rounded-lg border-black" />
            </a>

            <div v-if="gameState === 'panel'" class="grid grid-cols-2 gap-3 p-5 overflow-scroll">
                <img
                    v-for="panel in panelPieces"
                    :key="panel.url"
                    draggable="true"
                    @dragstart="canvas.onPanelDragStart($event, panel.url)"
                    :src="panel.url"
                    class="width-full cursor-grab"
                />
            </div>

            <div v-else-if="gameState === 'doodle'" class="grid grid-cols-3 gap-3 p-5 overflow-scroll">
                <Button
                    v-for="(button, i) in paletteButtons"
                    :key="i"
                    @click="(canvas.brush[button.key] as any) = button.value"
                    :active="canvas.brush[button.key] === button.value"
                    class="aspect-square"
                >
                    <div
                        v-if="button.key === 'color'"
                        :style="{ backgroundColor: button.value }"
                        class="aspect-square border w-full"
                    ></div>
                    {{ button.label }}
                </Button>
            </div>

            <div v-else-if="gameState === 'present'" class="flex flex-col gap-3 p-5 overflow-scroll">
                <Button
                    v-for="[sourceId, { senderId }] in submissions.entries()"
                    :active="selectedSubmission === sourceId"
                    @click="selectSubmission(sourceId)"
                >
                    🖼️ {{ sourceId }} <br />
                    🖌️{{ senderId }}
                </Button>
            </div>
        </aside>

        <main
            @dragover.prevent="canvas.onCanvasDragOver"
            @drop.prevent="canvas.onCanvasDrop"
            class="m-2 p-2 flex items-center justify-center min-h-0 min-w-0 overflow-hidden will-change-transform"
        >
            <canvas
                ref="canvas-element"
                :width="canvas.width"
                :height="canvas.height"
                class="border-5 rounded-xl border-black"
            />
        </main>

        <aside
            class="text-3xl text-center flex flex-col gap-3 m-2 p-2 items-center bg-center bg-no-repeat bg-size-[125%_100%]"
            :style="{ backgroundImage: `url('${backgrounds.tin_right}')` }"
        >
            <h2 class="text-shadow-lg text-shadow-white mt-5">Room Code:</h2>
            <input
                v-model="roomClient.roomCode.value"
                class="w-1/2 mb-5 border-4 border-black bg-stone-50 px-4 py-1.5 text-center font-extrabold uppercase tracking-widest text-black placeholder:text-stone-400 shadow-[4px_4px_0px_#000] focus:outline-none focus:bg-yellow-200 focus:-translate-x-px focus:-translate-y-px focus:shadow-[5px_5px_0px_#000]"
            />

            <h1 class="text-5xl text-shadow-lg text-shadow-white">{{ gameStateTitles[gameState] }}</h1>

            <Button active v-if="selfReady">Ready!!!! 👍</Button>
            <Button @click="sendReady" :disabled="!roomClient.isConnected.value" v-else>Ready Up!</Button>
            <Button @click="canvas.saveAsImage" class="text-xl mb-5">Save as Image</Button>

            <div class="flex flex-col gap-3 p-5 overflow-scroll h-full">
                <span
                    v-for="peerId in roomClient.peers.value"
                    class="text-shadow-lg text-shadow-white inline-flex items-center gap-1.5"
                >
                    <img class="w-15 h-15 shrink-0 object-contain" :src="getPlayerIcon(peerId)" />
                    <span>{{ peerId }}</span>
                    <span v-if="readyStatuses.has(peerId)">👍</span>
                </span>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.special-background {
    background-color: #ffde00;
    background-image:
        url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://w3.org cx='2' cy='2' r='2' fill='rgba(0,0,0,0.22)'/%3E%3Ccircle cx='10' cy='10' r='2' fill='rgba(0,0,0,0.22)'/%3E%3C/svg%3E"),
        linear-gradient(135deg, #ffde00 0%, #ff5e00 100%);
    background-size:
        16px 16px,
        100% 100%;
}
</style>
