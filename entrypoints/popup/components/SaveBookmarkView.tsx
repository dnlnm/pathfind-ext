import { useState, useEffect, useCallback, useRef } from 'react';
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
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveBookmarkViewProps {
    onOpenSettings: () => void;
}

export function SaveBookmarkView({ onOpenSettings }: SaveBookmarkViewProps) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [notesOpen, setNotesOpen] = useState(false);
    const [isReadLater, setIsReadLater] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

    const [collections, setCollections] = useState<Collection[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [alreadySaved, setAlreadySaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tag combobox state
    const [tagInput, setTagInput] = useState('');
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [highlightedTagIndex, setHighlightedTagIndex] = useState(-1);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Collection combobox state
    const [collectionInput, setCollectionInput] = useState('');
    const [showCollectionSuggestions, setShowCollectionSuggestions] = useState(false);
    const [highlightedCollectionIndex, setHighlightedCollectionIndex] = useState(-1);
    const collectionInputRef = useRef<HTMLInputElement>(null);

    const initialize = useCallback(async () => {
        setLoading(true);
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (tab?.url) {
                setUrl(tab.url);
                setTitle(tab.title || '');
            }
            const [collectionsData, tagsData] = await Promise.all([
                getCollections(),
                getTags(),
            ]);
            setCollections(collectionsData);
            setTags(tagsData);
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

    useEffect(() => { initialize(); }, [initialize]);

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

    // ── Tag helpers ──────────────────────────────────────────────────────────
    const tagSuggestions = tagInput.trim()
        ? tags.filter(t => t.name.includes(tagInput.toLowerCase().trim()) && !selectedTags.includes(t.name))
        : tags.filter(t => !selectedTags.includes(t.name));

    const addTag = (value?: string) => {
        const raw = (value ?? tagInput).toLowerCase().trim().replace(/\s+/g, '-');
        if (raw && !selectedTags.includes(raw)) {
            setSelectedTags(prev => [...prev, raw]);
        }
        setTagInput('');
        setShowTagSuggestions(false);
        setHighlightedTagIndex(-1);
        tagInputRef.current?.focus();
    };

    const removeTag = (tag: string) => setSelectedTags(prev => prev.filter(t => t !== tag));

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setShowTagSuggestions(true);
            setHighlightedTagIndex(i => Math.min(i + 1, tagSuggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedTagIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Escape') {
            setShowTagSuggestions(false);
            setHighlightedTagIndex(-1);
        } else if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (showTagSuggestions && highlightedTagIndex >= 0 && tagSuggestions[highlightedTagIndex]) {
                addTag(tagSuggestions[highlightedTagIndex].name);
            } else {
                addTag();
            }
        }
    };

    // ── Collection helpers ───────────────────────────────────────────────────
    const collectionSuggestions = collections.filter(c =>
        c.name.toLowerCase().includes(collectionInput.toLowerCase().trim())
    );

    const toggleCollection = (id: string) =>
        setSelectedCollections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleCollectionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setShowCollectionSuggestions(true);
            setHighlightedCollectionIndex(i => Math.min(i + 1, collectionSuggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedCollectionIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Escape') {
            setShowCollectionSuggestions(false);
            setHighlightedCollectionIndex(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const col = collectionSuggestions[highlightedCollectionIndex];
            if (col) {
                toggleCollection(col.id);
                setCollectionInput('');
                setShowCollectionSuggestions(false);
                setHighlightedCollectionIndex(-1);
            }
        }
    };

    const selectedCollectionObjects = collections.filter(c => selectedCollections.includes(c.id));

    // ── Render states ────────────────────────────────────────────────────────
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

            {/* URL */}
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

                {/* Tags — combobox */}
                <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                        <TagIcon className="size-3" />
                        Tags
                    </Label>
                    <div className="relative">
                        <div className="flex gap-1.5">
                            <div className="relative flex-1">
                                <TagIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                                <Input
                                    ref={tagInputRef}
                                    value={tagInput}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        setTagInput(e.target.value);
                                        setShowTagSuggestions(true);
                                        setHighlightedTagIndex(-1);
                                    }}
                                    onFocus={() => setShowTagSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Search or create tag…"
                                    className="h-7 text-xs pl-7"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={() => addTag()}
                                disabled={!tagInput.trim()}
                            >
                                <Plus className="size-3" />
                            </Button>
                        </div>

                        {showTagSuggestions && tagSuggestions.length > 0 && (
                            <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border/50 bg-popover shadow-xl overflow-hidden">
                                <div className="px-2 py-0.5 border-b border-border/30">
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Tags</p>
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {tagSuggestions.map((tag, idx) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            className={cn(
                                                'w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 transition-colors cursor-pointer',
                                                idx === highlightedTagIndex
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted/60 text-foreground'
                                            )}
                                            onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                                            onMouseEnter={() => setHighlightedTagIndex(idx)}
                                        >
                                            <TagIcon className="size-3 shrink-0 opacity-50" />
                                            <span className="truncate">{tag.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {selectedTags.map(t => (
                                <Badge
                                    key={t}
                                    variant="secondary"
                                    className="text-[11px] gap-0.5 cursor-pointer hover:bg-destructive/20 transition-colors"
                                    onClick={() => removeTag(t)}
                                >
                                    {t}
                                    <X className="size-2.5" />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Collections — combobox */}
                {collections.length > 0 && (
                    <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1">
                            <FolderOpen className="size-3" />
                            Collections
                        </Label>
                        <div className="relative">
                            <div className="relative">
                                <FolderOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                                <Input
                                    ref={collectionInputRef}
                                    value={collectionInput}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        setCollectionInput(e.target.value);
                                        setShowCollectionSuggestions(true);
                                        setHighlightedCollectionIndex(-1);
                                    }}
                                    onFocus={() => setShowCollectionSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowCollectionSuggestions(false), 150)}
                                    onKeyDown={handleCollectionKeyDown}
                                    placeholder="Search collections…"
                                    className="h-7 text-xs pl-7"
                                />
                            </div>

                            {showCollectionSuggestions && collectionSuggestions.length > 0 && (
                                <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border/50 bg-popover shadow-xl overflow-hidden">
                                    <div className="px-2 py-0.5 border-b border-border/30">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Collections</p>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto">
                                        {collectionSuggestions.map((col, idx) => {
                                            const isSelected = selectedCollections.includes(col.id);
                                            return (
                                                <button
                                                    key={col.id}
                                                    type="button"
                                                    className={cn(
                                                        'w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 transition-colors cursor-pointer',
                                                        idx === highlightedCollectionIndex
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-muted/60 text-foreground'
                                                    )}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        toggleCollection(col.id);
                                                        setCollectionInput('');
                                                        setShowCollectionSuggestions(false);
                                                        setHighlightedCollectionIndex(-1);
                                                        collectionInputRef.current?.focus();
                                                    }}
                                                    onMouseEnter={() => setHighlightedCollectionIndex(idx)}
                                                >
                                                    <div
                                                        className="size-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: col.color || 'var(--primary)' }}
                                                    />
                                                    <span className="truncate flex-1">{col.name}</span>
                                                    {isSelected && (
                                                        <Check className={cn(
                                                            'size-3 shrink-0',
                                                            idx === highlightedCollectionIndex ? 'text-primary-foreground' : 'text-primary'
                                                        )} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedCollectionObjects.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                                {selectedCollectionObjects.map(col => (
                                    <Badge
                                        key={col.id}
                                        variant="outline"
                                        className="text-[11px] gap-0.5 cursor-pointer hover:bg-destructive/20 transition-colors"
                                        style={col.color ? {
                                            borderColor: `color-mix(in srgb, ${col.color} 40%, transparent)`,
                                            backgroundColor: `color-mix(in srgb, ${col.color} 12%, transparent)`,
                                            color: col.color,
                                        } : undefined}
                                        onClick={() => toggleCollection(col.id)}
                                    >
                                        <div
                                            className="size-1.5 rounded-full shrink-0"
                                            style={{ backgroundColor: col.color || 'var(--primary)' }}
                                        />
                                        {col.name}
                                        <X className="size-2.5" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notes — collapsible */}
                <div className="space-y-1">
                    <button
                        type="button"
                        className="flex items-center gap-1 w-full cursor-pointer"
                        onClick={() => setNotesOpen(o => !o)}
                    >
                        <StickyNote className="size-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                            Notes
                            {notes.trim() && !notesOpen && (
                                <span className="ml-1 text-[9px] font-normal text-muted-foreground">(has content)</span>
                            )}
                        </span>
                        <ChevronDown
                            className={cn(
                                'size-3 text-muted-foreground transition-transform duration-200 ml-auto',
                                notesOpen && 'rotate-180'
                            )}
                        />
                    </button>
                    <div
                        className={cn(
                            'grid transition-all duration-200',
                            notesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        )}
                    >
                        <div className="overflow-hidden">
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add a note…"
                                className="min-h-[56px] text-xs resize-none mt-1"
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

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
                <Button className="w-full" onClick={handleSave} disabled={saving || !url}>
                    {saving ? (
                        <><Loader2 className="size-4 animate-spin" />Saving...</>
                    ) : alreadySaved ? (
                        <><BookmarkCheck className="size-4" />Update Bookmark</>
                    ) : (
                        <><Bookmark className="size-4" />Save Bookmark</>
                    )}
                </Button>
            </div>
        </div>
    );
}
