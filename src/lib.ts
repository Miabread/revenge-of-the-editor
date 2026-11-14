import { onMounted, onUnmounted, readonly, ref } from 'vue';

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
