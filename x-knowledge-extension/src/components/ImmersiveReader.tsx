import React from 'react';
import { ParsedTweet } from '../utils/twitterParser';
import { useMediaCache } from '../hooks/useMediaCache';

// --- Subcomponents for Cached Media ---
const CachedImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { srcUrl: string }> = ({ srcUrl, ...props }) => {
    const cachedSrc = useMediaCache(srcUrl);
    return <img src={cachedSrc || srcUrl} {...props} />;
};

const CachedVideo: React.FC<React.VideoHTMLAttributes<HTMLVideoElement> & { srcUrl: string, posterUrl?: string }> = ({ srcUrl, posterUrl, ...props }) => {
    const cachedSrc = useMediaCache(srcUrl);
    const cachedPoster = useMediaCache(posterUrl);
    return <video src={cachedSrc || srcUrl} poster={cachedPoster || posterUrl} {...props} />;
};
// --------------------------------------

interface ImmersiveReaderProps {
    tweet: ParsedTweet;
    onClose: () => void;
    onImageClick: (url: string) => void;
}

export const ImmersiveReader: React.FC<ImmersiveReaderProps> = ({ tweet, onClose, onImageClick }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-x-bg overflow-y-auto w-full h-full flex flex-col">
            {/* 顶部导航 */}
            <div className="sticky top-0 bg-x-bg/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-x-border z-10">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-x-bgHover transition-colors flex items-center justify-center mr-4"
                >
                    <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <span className="text-xl font-bold text-x-text">帖子</span>
            </div>

            <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
                {/* 作者信息 */}
                <div className="flex items-center space-x-3 mb-4">
                    {tweet.authorAvatar && (
                        <CachedImage srcUrl={tweet.authorAvatar} alt={tweet.authorName} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                        <div className="font-bold text-x-text text-base">{tweet.authorName}</div>
                        <div className="text-sm text-x-textMuted">@{tweet.authorHandle}</div>
                    </div>
                </div>

                {/* 文本内容（放大版但向原生贴近） */}
                <div className="text-x-text text-[17px] whitespace-pre-wrap word-break mb-6 leading-relaxed">
                    {tweet.text}
                </div>

                {/* 媒体内容 */}
                {tweet.media && tweet.media.length > 0 && (
                    <div className={`mt-4 mb-6 grid gap-2 ${tweet.media.length === 1 ? 'grid-cols-1' : tweet.media.length === 2 ? 'grid-cols-2' : tweet.media.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                        {tweet.media.map((item, i) => (
                            <div key={i} className={`relative rounded-2xl overflow-hidden border border-x-border ${tweet.media!.length === 3 && i === 0 ? 'col-span-2' : ''} ${tweet.media!.length === 1 ? 'max-h-[500px]' : 'max-h-64'}`}>
                                {item.type === 'video' || item.type === 'animated_gif' ? (
                                    <CachedVideo
                                        srcUrl={item.url}
                                        posterUrl={item.previewUrl}
                                        controls
                                        className="w-full h-full object-cover bg-x-bgHover"
                                    />
                                ) : (
                                    <CachedImage
                                        srcUrl={item.url}
                                        alt="Media"
                                        className="w-full h-full object-cover bg-x-bgHover cursor-pointer"
                                        onClick={() => onImageClick(item.url)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 时间和数据统计 */}
                <div className="text-x-textMuted text-sm border-b border-x-border pb-4 mb-4 flex gap-2 flex-wrap">
                    <span>{new Date(tweet.createdAt).toLocaleString()}</span>
                </div>

                <div className="flex text-x-textMuted text-sm pb-4 border-b border-x-border gap-6">
                    <span className="flex items-center gap-2">
                        <span className="font-bold text-x-text">{tweet.metrics.retweetCount || 0}</span>
                        <span>转推</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="font-bold text-x-text">{tweet.metrics.likeCount || 0}</span>
                        <span>喜欢</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="font-bold text-x-text">{tweet.metrics.bookmarkCount || 0}</span>
                        <span>书签</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
