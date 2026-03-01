import { useState, useEffect } from 'react';
import type { BookmarkResult } from '@/lib/api';

interface SearchInjectorPanelProps {
    query: string;
    serverUrl: string;
}

export function SearchInjectorPanel({ query, serverUrl }: SearchInjectorPanelProps) {
    const [results, setResults] = useState<BookmarkResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const response = await browser.runtime.sendMessage({
                    type: 'searchBookmarks',
                    query,
                    limit: 5,
                });
                if (!cancelled) {
                    setResults(response?.bookmarks || []);
                }
            } catch {
                if (!cancelled) setResults([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [query]);

    // Don't render anything if still loading or no results
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        <span style={styles.headerTitle}>PathFind</span>
                    </div>
                </div>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                </div>
            </div>
        );
    }

    if (results.length === 0) return null;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                    <span style={styles.headerTitle}>PathFind</span>
                    <span style={styles.badge}>{results.length}</span>
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={styles.collapseBtn}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                        }}
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>
            </div>

            {/* Results */}
            {!collapsed && (
                <div style={styles.resultsList}>
                    {results.map((bookmark) => (
                        <a
                            key={bookmark.id}
                            href={bookmark.url}
                            style={styles.resultItem}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(120, 120, 120, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            {/* URL line with favicon */}
                            <div style={styles.urlLine}>
                                {bookmark.favicon && (
                                    <img
                                        src={bookmark.favicon}
                                        alt=""
                                        width={14}
                                        height={14}
                                        style={styles.favicon}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                )}
                                <span style={styles.urlText}>
                                    {(() => {
                                        try {
                                            return new URL(bookmark.url).hostname.replace('www.', '');
                                        } catch {
                                            return bookmark.url;
                                        }
                                    })()}
                                </span>
                            </div>

                            {/* Title */}
                            <div style={styles.resultTitle}>
                                {bookmark.title || bookmark.url}
                            </div>

                            {/* Description */}
                            {bookmark.description && (
                                <div style={styles.resultDescription}>
                                    {bookmark.description.length > 120
                                        ? bookmark.description.slice(0, 120) + '…'
                                        : bookmark.description}
                                </div>
                            )}

                            {/* Tags */}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                                <div style={styles.tagsContainer}>
                                    {bookmark.tags.slice(0, 4).map((tag) => (
                                        <span key={tag.id} style={styles.tag}>
                                            {tag.name}
                                        </span>
                                    ))}
                                    {bookmark.tags.length > 4 && (
                                        <span style={styles.tagMore}>+{bookmark.tags.length - 4}</span>
                                    )}
                                </div>
                            )}
                        </a>
                    ))}

                    {/* Footer */}
                    <a
                        href={`${serverUrl}/?q=${encodeURIComponent(query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.footer}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(120, 120, 120, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }}
                    >
                        Search all in PathFind →
                    </a>
                </div>
            )}
        </div>
    );
}

// ── Inline styles (injected inside shadow DOM, no external CSS needed) ────────

const styles: Record<string, React.CSSProperties> = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#e8eaed',
        backgroundColor: '#303134',
        border: '1px solid #3c4043',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        minWidth: '360px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid #3c4043',
        backgroundColor: '#282a2d',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    headerTitle: {
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '-0.01em',
        color: '#e8eaed',
    },
    badge: {
        fontSize: '10px',
        fontWeight: 600,
        backgroundColor: 'rgba(138,180,248,0.15)',
        color: '#8ab4f8',
        borderRadius: '10px',
        padding: '1px 7px',
        lineHeight: '16px',
    },
    collapseBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9aa0a6',
        transition: 'background 0.15s',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid #3c4043',
        borderTopColor: '#8ab4f8',
        borderRadius: '50%',
        animation: 'pf-spin 0.6s linear infinite',
    },
    resultsList: {
        display: 'flex',
        flexDirection: 'column',
    },
    resultItem: {
        display: 'block',
        padding: '10px 14px',
        textDecoration: 'none',
        color: 'inherit',
        borderBottom: '1px solid #3c4043',
        transition: 'background 0.15s',
    },
    urlLine: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '2px',
    },
    favicon: {
        borderRadius: '2px',
        flexShrink: 0,
    },
    urlText: {
        fontSize: '11px',
        color: '#9aa0a6',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    resultTitle: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#8ab4f8',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: '2px',
    },
    resultDescription: {
        fontSize: '12px',
        color: '#bdc1c6',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        marginTop: '6px',
    },
    tag: {
        fontSize: '10px',
        fontWeight: 500,
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#9aa0a6',
        borderRadius: '4px',
        padding: '1px 6px',
        lineHeight: '16px',
    },
    tagMore: {
        fontSize: '10px',
        color: '#5f6368',
        lineHeight: '18px',
    },
    footer: {
        display: 'block',
        padding: '10px 14px',
        textDecoration: 'none',
        color: '#8ab4f8',
        fontSize: '12px',
        fontWeight: 500,
        textAlign: 'center',
        transition: 'background 0.15s',
    },
};
