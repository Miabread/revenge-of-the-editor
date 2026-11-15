<script setup lang="ts">
import { ref } from 'vue';
import PanelEditor from './PanelEditor.vue';
import DoodleEditor from './DoodleEditor.vue';
import Button from './Button.vue';
import { useRoom } from './netcode.ts';
import { useCanvas } from './canvas.ts';
import PresentEditor from './PresentEditor.vue';

interface Submission {
    senderId: string;
    imageDataUrl: string;
}

const gameState = ref<'panel' | 'doodle' | 'present'>('panel');
const gameStateTitles = {
    panel: 'Place your panels!',
    doodle: 'Doodle your edits!',
    present: "Let't see those comics!",
};

const canvas = useCanvas();

const submissions = ref(new Map<string, Submission>());
const readyStatuses = ref(new Map<string, boolean>());
const userContextId = ref('');
const selfReady = ref(false);

const createRandomSwap = () => {
    const shuffled = [...submissions.value.keys()];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const assignments: Record<string, string> = {};
    for (let i = 0; i < shuffled.length; i++) {
        const recipientId = shuffled[i];
        const donorId = shuffled[(i + 1) % shuffled.length];
        assignments[recipientId] = donorId;
    }

    return assignments;
};

type Message =
    | { type: 'panel_ready'; imageDataUrl: string }
    | { type: 'doodle_ready'; imageDataUrl: string; sourceId: string }
    | { type: 'panel_continue'; assignments: Record<string, string> }
    | { type: 'doodle_continue' | 'present_ready' | 'present_continue' };

const finalReadyIntoContinue = () =>
    roomClient.isHost.value &&
    roomClient.peers.value.length >= 2 &&
    submissions.value.size >= roomClient.peers.value.length &&
    readyStatuses.value.size >= roomClient.peers.value.length;

const roomClient = useRoom<Message>(async (payload) => {
    switch (payload.type) {
        case 'panel_ready': {
            submissions.value.set(payload.senderId, payload);
            readyStatuses.value.set(payload.senderId, true);

            if (finalReadyIntoContinue()) {
                await roomClient.send({
                    type: 'panel_continue',
                    assignments: createRandomSwap(),
                });
            }
            break;
        }

        case 'panel_continue': {
            const sourceId = payload.assignments[roomClient.clientId];
            const submission = submissions.value.get(sourceId);
            userContextId.value = sourceId;

            submissions.value.clear();
            readyStatuses.value.clear();
            selfReady.value = false;

            gameState.value = 'doodle';

            if (!submission) return;
            canvas.setDataUrl(submission.imageDataUrl);
            break;
        }

        case 'doodle_ready': {
            submissions.value.set(payload.sourceId, payload);
            readyStatuses.value.set(payload.senderId, true);

            if (finalReadyIntoContinue()) {
                await roomClient.send({
                    type: 'doodle_continue',
                });
            }
            break;
        }

        case 'doodle_continue': {
            const submission = submissions.value.get(roomClient.clientId);

            readyStatuses.value.clear();
            selfReady.value = false;

            gameState.value = 'present';

            if (!submission) return;
            canvas.setDataUrl(submission.imageDataUrl);
            break;
        }

        case 'present_ready': {
            readyStatuses.value.set(payload.senderId, true);

            if (finalReadyIntoContinue()) {
                await roomClient.send({
                    type: 'present_continue',
                });
            }
            break;
        }

        case 'present_continue': {
            readyStatuses.value.clear();
            canvas.clear();
            selfReady.value = false;

            gameState.value = 'panel';

            break;
        }
    }
});

const sendReady = async () => {
    const imageDataUrl = canvas.getDataUrl();
    if (!imageDataUrl) return;

    canvas.isDisabled.value = true;
    selfReady.value = true;

    switch (gameState.value) {
        case 'panel': {
            await roomClient.send({
                type: `panel_ready`,
                imageDataUrl,
            });
            break;
        }
        case 'doodle': {
            await roomClient.send({
                type: `doodle_ready`,
                imageDataUrl,
                sourceId: userContextId.value,
            });
            break;
        }
        case 'present': {
            await roomClient.send({
                type: `present_ready`,
            });
            break;
        }
    }
};

const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
};
</script>

<template>
    <div
        class="special-background font-bangers h-screen w-screen overflow-hidden grid grid-cols-[1fr_3fr_1fr] grid-rows-1"
    >
        <aside class="m-2 p-2 bg-[url('/assets/tin_left.png')] bg-center bg-no-repeat bg-size-[125%_100%]">
            <PanelEditor v-if="gameState === 'panel'" :canvas />
            <DoodleEditor v-else-if="gameState === 'doodle'" :canvas />
            <PresentEditor v-else-if="gameState === 'present'" :canvas />
        </aside>

        <main
            @dragover.prevent="canvas.onCanvasDragOver"
            @drop.prevent="canvas.onCanvasDrop"
            class="bg-stone-50 border-5 rounded-xl border-black m-2 p-2 grid place-items-center"
        >
            <canvas
                ref="canvas-element"
                :width="canvas.width"
                :height="canvas.height"
                class="border border-gray-600 w-full h-full object-contain"
            />
        </main>

        <aside
            class="text-3xl text-center flex flex-col gap-3 m-2 p-2 overflow-scroll items-center bg-[url('/assets/tin_right.png')] bg-center bg-no-repeat bg-size-[125%_100%]"
        >
            <h1 class="text-5xl text-shadow-lg text-shadow-white">{{ gameStateTitles[gameState] }}</h1>

            <Button active v-if="selfReady">Ready!!!! 👍</Button>
            <Button @click="sendReady" :disabled="!roomClient.isConnected" v-else>Ready Up!</Button>
            <Button @click="copyLinkToClipboard" class="text-xl">Copy Room Link</Button>
            <Button @click="canvas.saveAsImage" class="text-xl">Save as Image</Button>

            <span v-for="peer in roomClient.peers.value" class="text-shadow-lg text-shadow-white">
                {{ peer }} <template v-if="readyStatuses.has(peer)">👍</template>
            </span>
        </aside>
    </div>
</template>

<style scoped>
.special-background {
    background-color: #ffde00;
    background-image:
        radial-gradient(rgba(0, 0, 0, 0.25) 2px, transparent 0),
        radial-gradient(rgba(0, 0, 0, 0.25) 2px, transparent 0), linear-gradient(135deg, #ffde00 0%, #ff5e00 100%);
    background-size:
        16px 16px,
        16px 16px,
        100% 100%;
    background-position:
        0 0,
        8px 8px,
        0 0;
}
</style>
