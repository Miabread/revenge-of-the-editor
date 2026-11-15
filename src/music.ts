import { onMounted, onUnmounted } from 'vue';
import { music } from './constants';

export const useMusic = () => {
    const bgm = new Audio(music);
    bgm.loop = true;
    bgm.volume = 0.4;

    const unlockAudio = async () => {
        await bgm.play();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };

    onMounted(() => {
        unlockAudio();
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
    });

    onUnmounted(() => {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        bgm.pause();
    });
};
