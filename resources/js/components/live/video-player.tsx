import { useEffect, useRef } from 'react';
import { parseVideoSource } from '@/lib/media';
import { cn } from '@/lib/utils';

type VideoPlayerProps = {
    url: string;
    title: string;
    poster?: string | null;
    autoPlay?: boolean;
    className?: string;
};

/** Plays YouTube embeds, HLS streams (via hls.js) and plain video files. */
export default function VideoPlayer({
    url,
    title,
    poster,
    autoPlay = false,
    className,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const source = parseVideoSource(url);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || source.kind !== 'hls') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source.url;

            return;
        }

        let isDisposed = false;
        let destroyPlayer: (() => void) | undefined;

        void import('hls.js').then(({ default: Hls }) => {
            if (isDisposed || !Hls.isSupported()) {
                return;
            }

            const hls = new Hls();
            hls.loadSource(source.url);
            hls.attachMedia(video);
            destroyPlayer = () => hls.destroy();
        });

        return () => {
            isDisposed = true;
            destroyPlayer?.();
        };
    }, [source.kind, url]);

    if (source.kind === 'youtube') {
        return (
            <iframe
                src={source.embedUrl}
                title={title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                className={cn('h-full w-full border-0', className)}
            />
        );
    }

    return (
        <video
            ref={videoRef}
            src={source.kind === 'file' ? source.url : undefined}
            poster={poster ?? undefined}
            controls
            playsInline
            muted={autoPlay}
            autoPlay={autoPlay}
            aria-label={title}
            className={cn('h-full w-full bg-black object-contain', className)}
        />
    );
}
