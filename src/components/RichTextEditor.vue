<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import js from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Code,
  Undo,
  Redo,
} from 'lucide-vue-next'
import { watch } from 'vue'

const lowlight = createLowlight(common)
lowlight.register('js', js)
lowlight.register('css', css)
lowlight.register('html', html)

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    Placeholder.configure({
      placeholder: 'Le texte extrait apparaîtra ici...',
    }),
    Typography,
    TextStyle,
    Color,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        class: 'text-primary underline',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full',
      },
    }),
    Heading.configure({
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: 'font-bold',
      },
    }),
    HorizontalRule,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'rounded-md bg-muted p-4',
      },
    }),
  ],
  editable: !props.disabled,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue)
  }
})

// Watch for disabled changes
watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.setEditable(!newValue)
  }
})
</script>

<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="border-b p-2 flex gap-1 bg-muted/50">
      <button
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-muted': editor?.isActive('bold') }"
        class="p-2 rounded hover:bg-muted"
      >
        <Bold class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-muted': editor?.isActive('italic') }"
        class="p-2 rounded hover:bg-muted"
      >
        <Italic class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-muted': editor?.isActive('underline') }"
        class="p-2 rounded hover:bg-muted"
      >
        <UnderlineIcon class="h-4 w-4" />
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        @click="editor?.chain().focus().setTextAlign('left').run()"
        :class="{ 'bg-muted': editor?.isActive({ textAlign: 'left' }) }"
        class="p-2 rounded hover:bg-muted"
      >
        <AlignLeft class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().setTextAlign('center').run()"
        :class="{ 'bg-muted': editor?.isActive({ textAlign: 'center' }) }"
        class="p-2 rounded hover:bg-muted"
      >
        <AlignCenter class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().setTextAlign('right').run()"
        :class="{ 'bg-muted': editor?.isActive({ textAlign: 'right' }) }"
        class="p-2 rounded hover:bg-muted"
      >
        <AlignRight class="h-4 w-4" />
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-muted': editor?.isActive('bulletList') }"
        class="p-2 rounded hover:bg-muted"
      >
        <List class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-muted': editor?.isActive('orderedList') }"
        class="p-2 rounded hover:bg-muted"
      >
        <ListOrdered class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().toggleCodeBlock().run()"
        :class="{ 'bg-muted': editor?.isActive('codeBlock') }"
        class="p-2 rounded hover:bg-muted"
      >
        <Code class="h-4 w-4" />
      </button>
      <div class="w-px h-6 bg-border mx-1" />
      <button
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        class="p-2 rounded hover:bg-muted disabled:opacity-50"
      >
        <Undo class="h-4 w-4" />
      </button>
      <button
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        class="p-2 rounded hover:bg-muted disabled:opacity-50"
      >
        <Redo class="h-4 w-4" />
      </button>
    </div>
    <editor-content :editor="editor" class="prose max-w-none p-4 min-h-[300px] focus:outline-none" />
  </div>
</template>

<style>
.ProseMirror {
  min-height: 300px;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style> 