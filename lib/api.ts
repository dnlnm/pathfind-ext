import { getServerConfig } from './storage';

interface ApiOptions {
    method?: string;
    body?: unknown;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { serverUrl, apiToken } = await getServerConfig();

    if (!serverUrl || !apiToken) {
        throw new Error('Extension not configured. Please set your server URL and API token.');
    }

    const url = `${serverUrl}${path}`;
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
    };

    const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${res.status})`);
    }

    return res.json();
}

// --- Bookmarks ---

export interface BookmarkCheckResult {
    bookmarked: boolean;
}

export async function checkBookmark(url: string): Promise<boolean> {
    try {
        const result = await apiFetch<BookmarkCheckResult>(
            `/api/bookmarks/check?url=${encodeURIComponent(url)}`
        );
        return result.bookmarked;
    } catch {
        return false;
    }
}

export interface SaveBookmarkPayload {
    url: string;
    title?: string;
    description?: string;
    notes?: string;
    tags?: string[];
    collections?: string[];
    isReadLater?: boolean;
    isNsfw?: boolean;
}

export async function saveBookmark(payload: SaveBookmarkPayload) {
    return apiFetch('/api/bookmarks', {
        method: 'POST',
        body: payload,
    });
}

// --- Collections ---

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    _count: { bookmarks: number };
}

export async function getCollections(): Promise<Collection[]> {
    return apiFetch<Collection[]>('/api/collections');
}

// --- Tags ---

export interface Tag {
    id: string;
    name: string;
    createdAt: string;
    _count: { bookmarks: number };
}

export async function getTags(): Promise<Tag[]> {
    return apiFetch<Tag[]>('/api/tags');
}

// --- Search ---

export interface BookmarkResult {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    favicon: string | null;
    thumbnail: string | null;
    tags: { id: string; name: string }[];
    collections: { id: string; name: string; color?: string | null }[];
    createdAt: string;
}

interface BookmarksResponse {
    bookmarks: BookmarkResult[];
    total: number;
    page: number;
    totalPages: number;
}

export async function searchBookmarks(query: string, limit = 5): Promise<BookmarkResult[]> {
    try {
        const params = new URLSearchParams({ q: query, limit: String(limit) });
        const data = await apiFetch<BookmarksResponse>(`/api/bookmarks?${params}`);
        return data.bookmarks;
    } catch {
        return [];
    }
}

// --- Validation ---

export async function validateConnection(): Promise<boolean> {
    try {
        await getCollections();
        return true;
    } catch {
        return false;
    }
}
