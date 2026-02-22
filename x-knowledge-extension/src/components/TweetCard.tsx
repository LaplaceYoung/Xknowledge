import React, { useEffect, useRef, useState } from 'react';
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

interface TweetCardProps {
  tweet: ParsedTweet;
  index: number;
  analyzingId: string | null;
  pushingId: string | null;
  notionToken: string | null;
  notionDbId: string | null;
  onAnalyze: (tweet: ParsedTweet) => void;
  onDelete: (id: string) => void;
  onCopyMarkdown: (tweet: ParsedTweet) => void;
  onPushToObsidian?: (tweet: ParsedTweet) => void;
  onPushToNotion: (tweet: ParsedTweet) => void;
  onGenerateImage?: (tweet: ParsedTweet) => void;
  isGeneratingImage?: boolean;
  onUpdateTags?: (id: string, newTags: string[]) => void;
  onImageClick: (url: string) => void;
  // Optional callback for react-window to report height
  onHeightReady?: (index: number, height: number) => void;
  style?: React.CSSProperties;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  index,
  analyzingId,
  pushingId,
  notionToken,
  notionDbId,
  onAnalyze,
  onDelete,
  onCopyMarkdown,
  onPushToObsidian,
  onPushToNotion,
  onGenerateImage,
  isGeneratingImage,
  onUpdateTags,
  onImageClick,
  onHeightReady,
  style,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editTagsInput, setEditTagsInput] = useState('');

  const handleEditTagsStart = () => {
    if (tweet.aiAnalysis) {
      setEditTagsInput(tweet.aiAnalysis.tags.join(', '));
      setIsEditingTags(true);
    }
  };

  const handleEditTagsSave = () => {
    if (onUpdateTags && tweet.aiAnalysis) {
      const newTags = editTagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      onUpdateTags(tweet.id, newTags);
    }
    setIsEditingTags(false);
  };

  useEffect(() => {
    if (rowRef.current && onHeightReady) {
      // Use ResizeObserver to detect height changes (e.g., images loading)
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          // Add 16px to account for the mb-4 (margin-bottom) class on the element
          onHeightReady(index, entries[0].contentRect.height + 16);
        }
      });
      observer.observe(rowRef.current);
      return () => observer.disconnect();
    }
  }, [index, onHeightReady]);

  return (
    <div style={style}>
      <div id={`tweet-card-${tweet.id}`} ref={rowRef} className="bg-x-bg border border-x-border rounded-2xl p-4 shadow-sm hover:shadow transition-shadow mb-4">
        <div className="flex items-center space-x-3 mb-3">
          {tweet.authorAvatar && (
            <CachedImage srcUrl={tweet.authorAvatar} alt={tweet.authorName} className="w-10 h-10 rounded-full object-cover" />
          )}
          <div>
            <div className="font-bold text-sm text-x-text">{tweet.authorName}</div>
            <div className="text-xs text-x-textMuted">@{tweet.authorHandle}</div>
          </div>
        </div>

        {tweet.aiAnalysis && (
          <div className="mb-3 p-3 bg-x-primary/10/50 rounded-xl border border-blue-100/50">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                {tweet.aiAnalysis.category}
              </span>

              {isEditingTags ? (
                <div className="flex items-center gap-1 w-full mt-1">
                  <input
                    type="text"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                    className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1 outline-none focus:border-x-primary focus:ring-1 focus:ring-x-primary text-x-text"
                    placeholder="Enter tags separated by commas"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditTagsSave();
                      if (e.key === 'Escape') setIsEditingTags(false);
                    }}
                  />
                  <button onClick={handleEditTagsSave} className="text-green-600 hover:text-green-700 p-1" title="Save Tags">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button onClick={() => setIsEditingTags(false)} className="text-red-500 hover:text-red-600 p-1" title="Cancel">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-1 flex-wrap items-center group/tags">
                  {tweet.aiAnalysis.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-x-primary bg-x-bg border border-blue-100 px-1.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {onUpdateTags && (
                    <button onClick={handleEditTagsStart} className="opacity-0 group-hover/tags:opacity-100 transition-opacity text-blue-400 hover:text-blue-600 ml-1 p-0.5" title="Edit Tags">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-x-text font-medium leading-relaxed">
              {tweet.aiAnalysis.summary}
            </p>
          </div>
        )}

        <p className="text-sm text-x-text whitespace-pre-wrap mb-3 leading-relaxed">
          {tweet.text}
        </p>

        {tweet.media && tweet.media.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
            {tweet.media.map((m, i) => (
              <div key={i} className="flex-shrink-0">
                {m.type === 'photo' ? (
                  <CachedImage
                    srcUrl={m.url}
                    alt="media"
                    className="h-32 rounded-2xl object-cover border border-x-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick(m.url)}
                    onLoad={() => {
                      // Trigger height recalculation when image loads, add 16px for margin
                      if (rowRef.current && onHeightReady) {
                        onHeightReady(index, rowRef.current.getBoundingClientRect().height + 16);
                      }
                    }}
                  />
                ) : (
                  <CachedVideo
                    srcUrl={m.url}
                    posterUrl={m.previewUrl}
                    controls
                    className="h-32 rounded-2xl object-cover border border-x-border bg-black"
                    onLoadedData={() => {
                      if (rowRef.current && onHeightReady) {
                        onHeightReady(index, rowRef.current.getBoundingClientRect().height + 16);
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-x-textMuted flex justify-between items-center mt-4 pt-3 border-t border-x-border">
          <span>{new Date(tweet.createdAt).toLocaleDateString()}</span>
          <div className="flex gap-3 items-center">
            {!tweet.aiAnalysis && (
              <button
                onClick={() => onAnalyze(tweet)}
                disabled={analyzingId === tweet.id}
                className="text-x-primary hover:text-x-primaryHover font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {analyzingId === tweet.id ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-x-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : '✨ AI Analyze'}
              </button>
            )}

            <button
              onClick={() => onCopyMarkdown(tweet)}
              className="text-x-textMuted hover:text-x-text font-medium"
              title="Copy as Markdown"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {onPushToObsidian && (
              <button
                onClick={() => onPushToObsidian(tweet)}
                className="text-purple-500 hover:text-purple-600 font-medium"
                title="Send to Obsidian"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.42 1.488L1.614 6.643l.89 12.33 6.623 3.65 9.098-6.07 4.14-11.238-5.322-3.873-11.623.046zM6.55 3.332h8.046l3.52 2.56-4.52 10.435-4.2-12.003-2.846-1zM3.444 8.272L8.59 13.91l-5.694-5.232 4.908 9.53-4.516-9.742.155-.194z" />
                </svg>
              </button>
            )}

            {notionToken && notionDbId && (
              <button
                onClick={() => onPushToNotion(tweet)}
                disabled={pushingId === tweet.id}
                className="text-x-textMuted hover:text-x-text font-medium disabled:opacity-50"
                title="Push to Notion"
              >
                {pushingId === tweet.id ? (
                  <svg className="animate-spin h-4 w-4 text-x-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.459 4.208c.746-.386 1.344-.458 1.932-.458.825 0 2.296.262 4.417 1.571l7.859 4.88c.996.619 1.48.968 1.48 1.54 0 .445-.42 1.127-1.391 1.761l-7.792 5.093c-1.558 1.018-2.628 1.144-3.353 1.144-.813 0-1.464-.175-2.071-.43l-3.39-1.411c-.551-.23-.846-.628-.846-1.102 0-.323.167-.672.486-.976l6.766-6.44-5.263-1.638c-.524-.163-.827-.506-.827-.935 0-.337.169-.64.489-.884l1.504-1.126zm1.189 1.996l-1.385 1.037 6.131 1.91c.784.244 1.258.746 1.258 1.332 0 .425-.213.843-.591 1.2l-6.848 6.517 2.946 1.226c.465.194.945.32 1.565.32.553 0 1.41-.122 2.684-.954l7.668-5.011c.74-.483 1.059-1.028 1.059-1.38 0-.356-.37-.621-1.166-1.116l-7.77-4.825c-1.89-1.166-3.136-1.401-3.816-1.401-.482 0-.962.063-1.735.462v.683h.001z" />
                  </svg>
                )}
              </button>
            )}

            {onGenerateImage && (
              <button
                onClick={() => onGenerateImage(tweet)}
                disabled={isGeneratingImage}
                className="text-emerald-500 hover:text-emerald-600 font-medium disabled:opacity-50"
                title="Generate Shareable Image"
              >
                {isGeneratingImage ? (
                  <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            )}

            <a
              href={`https://x.com/${tweet.authorHandle}/status/${tweet.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-x-primary hover:text-x-primaryHover font-medium"
              title="View Original"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              onClick={() => onDelete(tweet.id)}
              className="text-red-400 hover:text-red-600 font-medium ml-1"
              title="Delete Bookmark"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
