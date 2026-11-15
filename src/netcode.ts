import { computed, onMounted, onUnmounted, readonly, ref, watch } from 'vue';
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

export const useRoomCode = () => {
    const roomCode = ref('');

    const updateRoomCode = () => {
        const hash = window.location.hash.slice(1).trim().toUpperCase();
        if (hash) {
            roomCode.value = hash;
            return;
        }

        const hex = Math.floor(Math.random() * 0x1000000).toString(16);
        const code = hex.padStart(6, '0').toUpperCase();

        roomCode.value = code;
        window.history.replaceState(null, '', `#${code}`);
    };

    onMounted(() => {
        updateRoomCode();
        window.addEventListener('hashchange', updateRoomCode);
    });

    onUnmounted(() => {
        window.removeEventListener('hashchange', updateRoomCode);
    });

    return readonly(roomCode);
};

const client = createClient(
    'https://ovqwzszrvhqctlbdlghg.supabase.co',
    'sb_publishable_HjJZzhBZ-T3LMg2sfzyFtQ_IwEhIY8W',
);

export function useRoom<T = unknown>(onMessage?: (payload: T & { senderId: string }) => void) {
    const roomCode = useRoomCode();

    const clientId = uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: ' ',
        style: 'capital',
    });

    const isConnected = ref(false);
    const peers = ref<string[]>([]);
    let channel: RealtimeChannel | null = null;

    const leaveRoom = async () => {
        if (!channel) return;

        await client.removeChannel(channel);
        channel = null;
        isConnected.value = false;
        peers.value = [];
    };

    onUnmounted(() => {
        leaveRoom();
    });

    watch(
        roomCode,
        async (newCode) => {
            if (!newCode) return;

            await leaveRoom();

            channel = client.channel(`room:${newCode}`, {
                config: {
                    broadcast: { self: true },
                    presence: { key: clientId },
                },
            });

            channel
                .on('broadcast', { event: 'meow' }, ({ payload }) => {
                    onMessage?.(payload);
                })
                .on('presence', { event: 'sync' }, () => {
                    if (!channel) return;
                    const state = channel.presenceState();
                    peers.value = Object.keys(state);
                })
                .subscribe(async (status) => {
                    isConnected.value = status === 'SUBSCRIBED';
                    if (status === 'SUBSCRIBED' && channel) {
                        await channel.track({ joined_at: Date.now() });
                    }
                });
        },
        { immediate: true },
    );

    const send = async (payload: T) => {
        if (!channel || !isConnected.value) return;
        await channel.send({
            type: 'broadcast',
            event: 'meow',
            payload: { ...payload, senderId: clientId },
        });
    };

    const isHost = computed(() => {
        const sorted = [...peers.value].sort();
        return sorted[0] === clientId;
    });

    return {
        clientId,
        isConnected,
        peers,
        send,
        isHost,
    };
}
