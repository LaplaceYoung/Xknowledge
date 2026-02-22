import { useState, useEffect } from 'react';
import { db } from '../utils/db';

export function useMediaCache(url: string | undefined) {
    const [src, setSrc] = useState<string | undefined>(url);

    useEffect(() => {
        let objectUrl: string | undefined;

        const loadCachedMedia = async () => {
            if (!url) return;

            try {
                const cached = await db.mediaCache.get(url);
                if (cached && cached.blob) {
                    objectUrl = URL.createObjectURL(cached.blob);
                    setSrc(objectUrl);
                } else {
                    setSrc(url); // Fallback to original URL
                }
            } catch (err) {
                console.error('[useMediaCache] Error loading from DB:', err);
                setSrc(url); // Fallback on error
            }
        };

        loadCachedMedia();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [url]);

    return src;
}
