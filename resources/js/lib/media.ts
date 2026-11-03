export type VideoSource =
    | { kind: 'youtube'; embedUrl: string }
    | { kind: 'hls'; url: string }
    | { kind: 'file'; url: string };

const YOUTUBE_ID =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export function parseVideoSource(url: string): VideoSource {
    const youtubeId = url.match(YOUTUBE_ID)?.[1];

    if (youtubeId) {
        return {
            kind: 'youtube',
            embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
        };
    }

    if (/\.m3u8(\?|$)/i.test(url)) {
        return { kind: 'hls', url };
    }

    return { kind: 'file', url };
}
