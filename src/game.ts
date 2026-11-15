import { ref, watch } from 'vue';
import { useRoom } from './netcode.ts';
import { useCanvas } from './canvas.ts';

export const useGame = () => {
    interface Submission {
        senderId: string;
        imageDataUrl: string;
    }

    const gameState = ref<'panel' | 'doodle' | 'present'>('panel');
    const submissions = ref(new Map<string, Submission>());
    const readyStatuses = ref(new Map<string, boolean>());
    const userContextId = ref('');
    const selfReady = ref(false);
    const selectedSubmission = ref('');

    const canvas = useCanvas();

    watch(
        gameState,
        () => {
            if (gameState.value === 'panel') {
                canvas.brush.enabled = false;
                canvas.isDisabled.value = false;
            } else if (gameState.value === 'doodle') {
                canvas.brush.enabled = true;
                canvas.isDisabled.value = false;
            } else if (gameState.value === 'present') {
                canvas.brush.enabled = false;
                canvas.isDisabled.value = true;
            }
        },
        { immediate: true },
    );

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
                selectedSubmission.value = roomClient.clientId;

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

    const selectSubmission = (sourceId: string) => {
        selectedSubmission.value = sourceId;
        const submission = submissions.value.get(sourceId);
        if (!submission) return;
        canvas.setDataUrl(submission.imageDataUrl);
    };

    return {
        sendReady,
        selectSubmission,
        canvas,
        gameState,
        submissions,
        selectedSubmission,
        roomClient,
        selfReady,
        readyStatuses,
    };
};
