<script setup lang="ts">
import { ref } from 'vue';
import PanelEditor from './PanelEditor.vue';
import DoodleEditor from './DoodleEditor.vue';
import Button from './Button.vue';
import { useRoom } from './netcode.ts';
import { useCanvas } from './canvas.ts';

interface Submission {
    senderId: string;
    imageDataUrl: string;
}

const activeTab = ref(0);
const tabs = ['Panel Phase', 'Doodle Phase'];

const canvas = useCanvas();

const submissions = ref<Map<string, Submission>>(new Map());

const createRandomSwap = () => {
    if (submissions.value.size < 2) return;

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
    | {
          type: 'SUBMIT_IMAGE';
          imageDataUrl: string;
      }
    | {
          type: 'SWAP_COMPLETE';
          assignments: Record<string, string>;
      };

const roomClient = useRoom<Message>(async (payload) => {
    if (payload.type === 'SUBMIT_IMAGE') {
        submissions.value.set(payload.senderId, payload);
    }

    if (
        payload.type === 'SUBMIT_IMAGE' &&
        roomClient.isHost.value &&
        roomClient.peers.value.length >= 2 &&
        submissions.value.size >= roomClient.peers.value.length
    ) {
        const assignments = createRandomSwap();
        if (!assignments) return;
        await roomClient.send({
            type: 'SWAP_COMPLETE',
            assignments,
        });
    }

    if (payload.type === 'SWAP_COMPLETE') {
        const submission = submissions.value.get(payload.assignments[roomClient.clientId]);
        submissions.value.clear();
        if (!submission) return;

        canvas.setDataUrl(submission.imageDataUrl);
    }
});

const sendCanvas = async () => {
    const imageDataUrl = canvas.getDataUrl();
    if (!imageDataUrl) return;

    await roomClient.send({
        type: 'SUBMIT_IMAGE',
        imageDataUrl,
    });
};
</script>

<template>
    <div
        class="special-background font-bangers h-screen w-screen overflow-hidden grid grid-cols-[1fr_3fr_1fr] grid-rows-[75px_1fr]"
    >
        <header class="col-span-3 bg-stone-50 border-4 border-black m-2 p-2 flex gap-3">
            <Button v-for="(tab, index) in tabs" :key="tab" :active="activeTab === index" @click="activeTab = index">
                {{ tab }}
            </Button>
            <Button @click="canvas.saveAsImage">Save as Image</Button>
            <Button @click="sendCanvas" :disabled="!roomClient.isConnected">Send Canvas</Button>
        </header>

        <aside class="m-2 p-2 overflow-scroll bg-[url('/assets/palette.png')] bg-center bg-no-repeat bg-cover">
            <PanelEditor v-if="activeTab === 0" :canvas />
            <DoodleEditor v-else-if="activeTab === 1" :canvas />
        </aside>

        <main
            @dragover.prevent="canvas.onCanvasDragOver"
            @drop.prevent="canvas.onCanvasDrop"
            class="bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll grid place-items-center"
        >
            <canvas ref="canvas-element" :width="canvas.width" :height="canvas.height" class="border border-gray-600" />
        </main>

        <aside class="flex flex-col gap-3 bg-stone-50 border-4 border-black m-2 p-2 overflow-scroll items-center">
            <span v-for="peer in roomClient.peers.value">
                {{ peer }} <template v-if="submissions.has(peer)">👍</template>
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
