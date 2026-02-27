import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    checkBookmark,
    saveBookmark,
    getCollections,
    getTags,
    type Collection,
    type Tag,
} from '@/lib/api';
import {
    Loader2,
    Bookmark,
    BookmarkCheck,
    Tag as TagIcon,
    FolderOpen,
    StickyNote,
    Settings,
    X,
    Check,
    Plus,
} from 'lucide-react';

interface SaveBookmarkViewProps {
    onOpenSettings: () => void;
}

export function SaveBookmarkView({ onOpenSettings }: SaveBookmarkViewProps) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [isReadLater, setIsReadLater] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [newTagInput, setNewTagInput] = useState('');

    const [collections, setCollections] = useState<Collection[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [alreadySaved, setAlreadySaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load current tab info and check if already bookmarked
    const initialize = useCallback(async () => {
        setLoading(true);
        try {
            // Get current tab
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (tab?.url) {
                setUrl(tab.url);
                setTitle(tab.title || '');
            }

            // Fetch collections and tags in parallel
            const [collectionsData, tagsData] = await Promise.all([
                getCollections(),
                getTags(),
            ]);
            setCollections(collectionsData);
            setTags(tagsData);

            // Check if URL is already bookmarked
            if (tab?.url) {
                const bookmarked = await checkBookmark(tab.url);
                setAlreadySaved(bookmarked);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleSave = async () => {
        if (!url) return;
        setSaving(true);
        setError(null);

        try {
            await saveBookmark({
                url,
                title: title || undefined,
                notes: notes || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                collections: selectedCollections.length > 0 ? selectedCollections : undefined,
                isReadLater,
            });
            setSaved(true);
            setAlreadySaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (tagName: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
        );
    };

    const addNewTag = () => {
        const tag = newTagInput.toLowerCase().trim();
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags((prev) => [...prev, tag]);
        }
        setNewTagInput('');
    };

    const toggleCollection = (collectionId: string) => {
        setSelectedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((c) => c !== collectionId)
                : [...prev, collectionId]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (saved) {
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-3">
                <div className="flex items-center justify-center size-12 rounded-full bg-emerald-500/10">
                    <BookmarkCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium">Bookmark saved!</p>
                <p className="text-xs text-muted-foreground text-center max-w-[250px] truncate">
                    {title || url}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {alreadySaved ? (
                        <BookmarkCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <Bookmark className="size-4" />
                    )}
                    <h1 className="text-sm font-semibold">
                        {alreadySaved ? 'Already Saved' : 'Save Bookmark'}
                    </h1>
                    {alreadySaved && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                            saved
                        </Badge>
                    )}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={onOpenSettings}>
                    <Settings className="size-3.5" />
                </Button>
            </div>

            {/* URL (read-only) */}
            <div className="mb-3">
                <p className="text-[11px] text-muted-foreground truncate mb-1">{url}</p>
            </div>

            {/* Form */}
            <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Page title"
                        className="h-8 text-sm"
                    />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-xs">
                        <StickyNote className="size-3" />
                        Notes
                    </Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add a note..."
                        className="min-h-[60px] text-sm resize-none"
                        rows={2}
                    />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                    <Label className="text-xs">
                        <TagIcon className="size-3" />
                        Tags
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 12).map((tag) => (
                            <Badge
                                key={tag.id}
                                variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                                className="text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => toggleTag(tag.name)}
                            >
                                {tag.name}
                                {selectedTags.includes(tag.name) && <Check className="size-2.5 ml-0.5" />}
                            </Badge>
                        ))}
                        {/* Inline new tag */}
                        {selectedTags
                            .filter((t) => !tags.some((tag) => tag.name === t))
                            .map((t) => (
                                <Badge
                                    key={t}
                                    variant="default"
                                    className="text-[11px] cursor-pointer"
                                    onClick={() => toggleTag(t)}
                                >
                                    {t}
                                    <X className="size-2.5 ml-0.5" />
                                </Badge>
                            ))}
                    </div>
                    <div className="flex gap-1.5 mt-1">
                        <Input
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            placeholder="New tag..."
                            className="h-7 text-xs flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addNewTag();
                                }
                            }}
                        />
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={addNewTag}
                            disabled={!newTagInput.trim()}
                        >
                            <Plus className="size-3" />
                        </Button>
                    </div>
                </div>

                {/* Collections */}
                {collections.length > 0 && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            <FolderOpen className="size-3" />
                            Collections
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                            {collections.map((col) => (
                                <Badge
                                    key={col.id}
                                    variant={selectedCollections.includes(col.id) ? 'default' : 'outline'}
                                    className="text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
                                    style={
                                        col.color && selectedCollections.includes(col.id)
                                            ? { backgroundColor: col.color, borderColor: col.color }
                                            : col.color
                                                ? { borderColor: col.color, color: col.color }
                                                : undefined
                                    }
                                    onClick={() => toggleCollection(col.id)}
                                >
                                    {col.icon && <span className="mr-0.5">{col.icon}</span>}
                                    {col.name}
                                    {selectedCollections.includes(col.id) && <Check className="size-2.5 ml-0.5" />}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Read Later */}
                <div className="flex items-center justify-between py-1">
                    <Label htmlFor="read-later" className="text-xs cursor-pointer">
                        Read Later
                    </Label>
                    <Switch
                        id="read-later"
                        size="sm"
                        checked={isReadLater}
                        onCheckedChange={setIsReadLater}
                    />
                </div>

                {error && (
                    <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Save button */}
                <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={saving || !url}
                >
                    {saving ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving...
                        </>
                    ) : alreadySaved ? (
                        <>
                            <BookmarkCheck className="size-4" />
                            Update Bookmark
                        </>
                    ) : (
                        <>
                            <Bookmark className="size-4" />
                            Save Bookmark
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
