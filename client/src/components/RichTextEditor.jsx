import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code, X, Upload, Globe, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Portal Popup Wrapper ─────────────────────────────────────
// Renders popup at document.body via portal so overflow-hidden can't clip it
const PopupPortal = ({ anchorRef, children, onClose, align = 'left' }) => {
    const popupRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    // Position relative to anchor button
    useEffect(() => {
        if (!anchorRef?.current) return;
        const updatePos = () => {
            const rect = anchorRef.current.getBoundingClientRect();
            setPos({
                top: rect.bottom + 8 + window.scrollY,
                left: align === 'right'
                    ? rect.right - 320 + window.scrollX // 320 = popup width (w-80)
                    : rect.left + window.scrollX,
            });
        };
        updatePos();
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [anchorRef, align]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                popupRef.current && !popupRef.current.contains(e.target) &&
                anchorRef?.current && !anchorRef.current.contains(e.target)
            ) {
                onClose();
            }
        };
        // Use setTimeout so the opening click doesn't immediately close it
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [onClose, anchorRef]);

    return createPortal(
        <div
            ref={popupRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
            className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl p-4"
        >
            {children}
        </div>,
        document.body
    );
};

// ─── Link Popup ───────────────────────────────────────────────
const LinkPopup = ({ editor, onClose, anchorRef }) => {
    const [url, setUrl] = useState(editor.getAttributes('link').href || '');
    const inputRef = useRef(null);

    useEffect(() => {
        // Small delay to ensure portal is mounted before focusing
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, []);

    const applyLink = () => {
        const finalUrl = url.trim();
        if (!finalUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            onClose();
            return;
        }

        let href = finalUrl;
        if (!/^https?:\/\//i.test(href)) href = 'https://' + href;

        const { from, to } = editor.state.selection;
        if (from === to) {
            // No text selected — show clean short label instead of full URL
            let label = 'Link';
            try {
                const parsed = new URL(href);
                label = parsed.hostname.replace(/^www\./, '');
            } catch {
                // If URL parsing fails, use a truncated version
                label = finalUrl.length > 30 ? finalUrl.substring(0, 30) + '…' : finalUrl;
            }
            editor
                .chain()
                .focus()
                .insertContent(`<a href="${href}">${label}</a>`)
                .run();
        } else {
            // Text is selected — wrap it with the link
            editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
        }
        onClose();
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        onClose();
    };

    return (
        <PopupPortal anchorRef={anchorRef} onClose={onClose} align="left">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Insert Link</span>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                    <X size={14} className="text-gray-400" />
                </button>
            </div>
            <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
            />
            <div className="flex gap-2 mt-3">
                <button
                    onClick={applyLink}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Apply
                </button>
                {editor.isActive('link') && (
                    <button
                        onClick={removeLink}
                        className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
                    >
                        Remove
                    </button>
                )}
            </div>
        </PopupPortal>
    );
};

// ─── Image Popup ──────────────────────────────────────────────
const ImagePopup = ({ editor, onClose, anchorRef }) => {
    const [tab, setTab] = useState('upload');
    const [url, setUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (tab === 'url') {
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [tab]);

    const insertFromUrl = () => {
        if (url.trim()) {
            editor.chain().focus().setImage({ src: url.trim() }).run();
            onClose();
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setUploading(true);
        const toastId = toast.loading('Uploading image...');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            editor.chain().focus().setImage({ src: res.data.imageUrl }).run();
            toast.success('Image inserted!', { id: toastId });
            onClose();
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <PopupPortal anchorRef={anchorRef} onClose={onClose} align="right">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Insert Image</span>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                    <X size={14} className="text-gray-400" />
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-4">
                <button
                    onClick={() => setTab('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'upload' ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Upload size={14} /> Upload
                </button>
                <button
                    onClick={() => setTab('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'url' ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Globe size={14} /> URL
                </button>
            </div>

            {tab === 'url' ? (
                <>
                    <input
                        ref={inputRef}
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && insertFromUrl()}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    />
                    <button
                        onClick={insertFromUrl}
                        disabled={!url.trim()}
                        className="w-full mt-3 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Insert Image
                    </button>
                </>
            ) : (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleUpload(file);
                            e.target.value = '';
                        }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-gray-200 dark:border-white/15 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={28} className="text-indigo-500 animate-spin" />
                                <span className="text-sm font-medium text-gray-500">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Upload size={24} className="text-indigo-500" />
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Click to upload</span>
                                    <span className="text-xs text-gray-400 mt-1 block">JPG, PNG, WebP, GIF — max 5MB</span>
                                </div>
                            </>
                        )}
                    </button>
                </>
            )}
        </PopupPortal>
    );
};

// ─── Menu Bar ──────────────────────────────────────────────────
const MenuBar = ({ editor }) => {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [showImagePopup, setShowImagePopup] = useState(false);
    const linkBtnRef = useRef(null);
    const imageBtnRef = useRef(null);

    if (!editor) return null;

    return (
        <div className="relative flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm rounded-t-3xl transition-all">
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-white/10">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
                <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strike" />
            </div>

            <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-white/10">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
            </div>

            <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-white/10">
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
                <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Blockquote" />
            </div>

            <div className="flex items-center gap-1">
                <MenuButton
                    ref={linkBtnRef}
                    onClick={() => { setShowLinkPopup(!showLinkPopup); setShowImagePopup(false); }}
                    isActive={editor.isActive('link') || showLinkPopup}
                    icon={LinkIcon}
                    title="Link"
                />
                <MenuButton
                    ref={imageBtnRef}
                    onClick={() => { setShowImagePopup(!showImagePopup); setShowLinkPopup(false); }}
                    isActive={showImagePopup}
                    icon={ImageIcon}
                    title="Image"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon={Code}
                    title="Code Block"
                />
            </div>

            {/* Popups rendered via portal */}
            {showLinkPopup && <LinkPopup editor={editor} onClose={() => setShowLinkPopup(false)} anchorRef={linkBtnRef} />}
            {showImagePopup && <ImagePopup editor={editor} onClose={() => setShowImagePopup(false)} anchorRef={imageBtnRef} />}

            <div className="ml-auto flex items-center gap-1 pl-3 border-l border-gray-200 dark:border-white/10">
                <MenuButton onClick={() => editor.chain().focus().undo().run()} isActive={false} icon={Undo} title="Undo" />
                <MenuButton onClick={() => editor.chain().focus().redo().run()} isActive={false} icon={Redo} title="Redo" />
            </div>
        </div>
    );
};

import { forwardRef } from 'react';

const MenuButton = forwardRef(({ onClick, isActive, icon: Icon, title }, ref) => (
    <button
        ref={ref}
        onClick={onClick}
        title={title}
        className={`p-2 rounded-lg transition-all ${isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        <Icon size={18} />
    </button>
));

const RichTextEditor = ({ content, onChange, placeholder = 'Tell your story...', minHeight = '500px' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-500 hover:underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert max-w-none focus:outline-none min-h-[${minHeight}] px-6 py-8 font-display text-lg leading-relaxed`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="w-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/30">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="min-h-[500px]" />
        </div>
    );
};

export default RichTextEditor;
