import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CustomLink = Link.configure({
  defaultProtocol: "https",
  openOnClick: "whenNotEditable",
  protocols: ["http", "https", "mailto"],
  linkOnPaste: true,
  autolink: true,
  HTMLAttributes: {
    class: "custom-link",
  },
});

export default function TipTapEditor({
  content,
  onChange,
}: {
  content: string;
  onChange?: (html: string) => void;
}) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const linkInputRef = useRef(null);
  const linkTextRef = useRef(null);
  const [selectedText, setSelectedText] = useState("");
  const [useCustomText, setUseCustomText] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [isExternalLink, setExternalLink] = useState(false);

  useEffect(() => {
    if (!showLinkModal) {
      setExternalLink(false);
    }
  }, [showLinkModal]);

  const editor = useEditor({
    injectCSS: true,
    extensions: [StarterKit, Image, CustomLink],
    content: content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleLinkSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent form submission and page reload

    const url = linkInputRef.current.value;

    if (url) {
      if (hasSelection) {
        // If we had a selection
        if (useCustomText && linkTextRef.current && linkTextRef.current.value) {
          // Remove current selection and insert custom text with link
          editor.chain().focus().deleteSelection().run();
          editor
            .chain()
            .focus()
            .insertContent({
              type: "text",
              text: linkTextRef.current.value,
              marks: [
                {
                  type: "link",
                  attrs: isExternalLink
                    ? {
                        href: url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : { href: url, target: null, rel: null },
                },
              ],
            })
            .run();
        } else {
          // Apply link to the selected text
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink(
              isExternalLink
                ? { href: url, target: "_blank", rel: "noopener noreferrer" }
                : { href: url, target: null, rel: null },
            )
            .run();
        }
      } else {
        // No selection - insert new link with custom text
        const text = linkTextRef.current?.value || url;
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: text,
            marks: [
              {
                type: "link",
                attrs: isExternalLink
                  ? { href: url, target: "_blank", rel: "noopener noreferrer" }
                  : { href: url, target: null, rel: null },
              },
            ],
          })
          .run();
      }
    }

    // Close the modal
    setShowLinkModal(false);
    setUseCustomText(false);
    setExternalLink(false);
  };

  const addLink = () => {
    // Get the selected text
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");

    // Check if there's a selection
    const hasTextSelected = from !== to;
    setHasSelection(hasTextSelected);

    // Store the selected text if there is one
    if (hasTextSelected) {
      setSelectedText(text);
      // When there's a selection, don't automatically use custom text
      setUseCustomText(false);
    } else {
      // If no selection, default to using custom text
      setUseCustomText(true);
      setSelectedText("");
    }

    // Show our custom link modal
    setShowLinkModal(true);
  };

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 4 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
        >
          <Heading4 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 5 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
        >
          <Heading5 className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-6 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-6 bg-border mx-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addLink();
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Use shadcn Dialog instead of custom modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              {hasSelection
                ? "Add a link to the selected text"
                : "Insert a new link"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLinkSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  ref={linkInputRef}
                  defaultValue="https://"
                  placeholder="https://example.com"
                  className="col-span-3"
                />
              </div>

              {hasSelection && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-custom-text"
                    checked={useCustomText}
                    onCheckedChange={setUseCustomText}
                  />
                  <label
                    htmlFor="use-custom-text"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Use custom link text
                  </label>
                </div>
              )}

              {(useCustomText || !hasSelection) && (
                <div className="grid gap-2">
                  <Label htmlFor="link-text">Link Text</Label>
                  <Input
                    id="link-text"
                    ref={linkTextRef}
                    defaultValue={selectedText}
                    placeholder="Link text"
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-external-link"
                  checked={isExternalLink}
                  onCheckedChange={setExternalLink}
                />
                <label
                  htmlFor="use-external-link"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  External Link?
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="px-4 min-h-[200px] prose max-w-none h-full flex flex-col">
        <EditorContent
          editor={editor}
          style={{
            outline: "none",
            flex: 1,
            // display: "flex",
            // alignItems: "stretch",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
}
