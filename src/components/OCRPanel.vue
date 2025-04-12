<template>
    <Dialog :open="true" @update:open="$emit('close')">
      <DialogContent class="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Éditeur de texte OCR</DialogTitle>
          <DialogDescription>
            Modifiez et révisez le texte OCR avec les suggestions générées par l'IA.
          </DialogDescription>
          <div class="flex justify-start mt-2">
            <Button 
              variant="secondary"  
              @click="startOcr" 
              class="gap-2"
              :disabled="isLoading"
            >
              <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
              <Scan v-else class="h-4 w-4" />
              {{ isLoading ? 'Traitement en cours...' : 'Lancer OCR' }}
            </Button>
          </div>
        </DialogHeader>
  
        <div class="flex-1 flex gap-6 overflow-hidden">
         <!-- Document Preview Panel (Left) -->
         <div class="w-1/2 h-full flex flex-col border rounded-lg overflow-hidden">
              
              <div class="flex-1 overflow-auto p-4">
                <div class="bg-muted rounded-lg overflow-hidden h-full flex items-center justify-center">
                  <!-- PDF Preview -->
                  <div v-if="selectedDocument.type?.toLowerCase().includes('pdf')" class="w-full h-full">
                    <iframe
                      :src="documentUrl"
                      class="w-full h-full"
                      frameborder="0"
                    ></iframe>
                  </div>
                  
                  <!-- Image Preview -->
                  <div v-else-if="selectedDocument.type?.toLowerCase().includes('image')" class="w-full h-full">
                    <div class="relative w-full h-full">
                      <img
                        :src="documentUrl"
                        :alt="selectedDocument.name"
                        class="w-full h-full object-contain"
                        @load="imageLoading = false"
                      />
                      <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                      <!-- Fallback icon only shown on error -->
                      <div class="absolute inset-0 flex items-center justify-center bg-muted/50 hidden">
                        <div class="flex flex-col items-center">
                          <ImageIcon class="h-12 w-12 text-muted-foreground mb-2" />
                          
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Default Preview -->
                  <div v-else class="w-full h-full flex flex-col items-center justify-center p-8">
                    <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                      <FileText class="h-12 w-12 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span class="text-sm text-muted-foreground">{{ selectedDocument.type || 'Document' }}</span>
                  </div>
                </div>
              </div>
            </div>
  
          <!-- OCR Text Editor Panel (Right) -->
          <div class="w-1/2 h-full flex flex-col relative">
            <!-- Action Buttons -->
            <div class="flex justify-end gap-2 p-2 border-b">
              <Button variant="outline" size="sm" @click="exportToDoc">
                <FileText class="h-4 w-4 mr-2" />
                Exporter en DOC
              </Button>
              <Button variant="outline" size="sm" @click="exportToPdf">
                <FileText class="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
              <Button variant="outline" size="sm" @click="copyToClipboard">
                <Copy class="h-4 w-4 mr-2" />
                Copier
              </Button>
            </div>
            <div class="flex-1 overflow-auto border rounded-lg bg-muted/30 relative">
              <!-- Loading State -->
              <div v-if="isLoading" class="w-full h-full flex flex-col items-center justify-center p-8">
                <Loader2 class="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <span class="text-sm text-muted-foreground">Extraction du texte en cours...</span>
              </div>
              <!-- Editable Text Div -->
              <div
                v-else
                :contenteditable="!!editorContent"
                ref="editableTextRef"
                @input="syncEditorContent"
                @mouseover="handleWordHover"
                @mouseleave="handleWordLeave"
                v-html="editorContent ? renderedContent : 'Le texte extrait par OCR sera affiché ici...'"
                class="w-full min-h-[300px] p-4 text-sm font-mono border border-transparent bg-transparent focus:outline-none relative"
                :class="{ 
                  'text-muted-foreground': !editorContent,
                  'cursor-not-allowed': !editorContent,
                  'bg-muted/20': !editorContent
                }"
              ></div>

              <!-- Floating Action Button -->
              <div v-if="editorContent" class="absolute bottom-4 left-4">
                <div class="relative floating-action-button">
                  <Button 
                    variant="default" 
                    size="icon" 
                    class="rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground w-12 h-12"
                    @click="toggleActionMenu"
                  >
                    <AlertCircle class="h-6 w-6" />
                    <span v-if="errorCount > 0" class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center error-badge">
                      {{ errorCount }}
                    </span>
                  </Button>

                  <!-- Action Menu -->
                  <div v-if="showActionMenu" class="absolute bottom-full left-0 mb-2 bg-popover text-popover-foreground rounded-lg shadow-lg p-2 min-w-[200px] border">
                    <div class="text-sm font-medium px-2 py-1 mb-2 border-b">
                      {{ errorCount }} erreur(s) détectée(s)
                    </div>
                    <button 
                      class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded flex items-center gap-2"
                      @click="summarizeText"
                    >
                      <FileText class="h-4 w-4" />
                      Résumer le texte
                    </button>
                    <button 
                      class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded flex items-center gap-2"
                      @click="checkGrammar"
                    >
                      <Check class="h-4 w-4" />
                      Vérification grammaticale
                    </button>
                    <button 
                      class="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded flex items-center gap-2"
                      @click="translateText"
                    >
                      <Languages class="h-4 w-4" />
                      Traduire
                    </button>
                  </div>
                </div>
              </div>

              <!-- Word Suggestions Dropdown -->
              <div v-if="selectedWord && dropdownPosition" 
                  class="suggestion-dropdown" 
                  :style="dropdownStyle"
                  @mouseenter="isHoveringDropdown = true"
                  @mouseleave="isHoveringDropdown = false">
                <div class="p-1 text-xs text-muted-foreground border-b mb-1">
                  Cliquez pour remplacer le mot
                </div>
                <button
                  v-for="suggestion in getSuggestionsForWord(selectedWord)"
                  :key="suggestion"
                  @click="applySuggestion(suggestion)"
                  class="suggestion-item"
                >
                  {{ suggestion }}
                </button>
                <button @click="ignoreSuggestion()" class="suggestion-item text-gray-500">
                  <div class="flex items-center gap-2 w-full">
                    <Trash2 class="h-4 w-4" />
                    <span>Ignorer</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <DialogFooter class="mt-4 flex justify-between items-center">
          <div v-if="hasStartedOcr" class="flex items-center gap-4 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4" />
              <span>{{ processingTime }}s</span>
            </div>
            <div class="flex items-center gap-2">
              <Target class="h-4 w-4" />
              <span>Précision: {{ precision }}%</span>
            </div>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="$emit('close')">Fermer</Button>
            <Button @click="handleSave">Enregistrer</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useToast } from '@/components/ui/toast/use-toast'
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { FileText, Image as ImageIcon, Loader2, X, Scan, Copy, Trash2, AlertCircle, Check, Languages, Clock, Target } from 'lucide-vue-next'
  import { documents as documentsService } from '@/services/api'
  import { jsPDF } from 'jspdf'
  import type { CSSProperties } from 'vue';

  
  // Props
  interface Props {
    initialContent?: string
    ocrSuggestions: Array<{
      word: string
      suggestions: string[]
      start: number
      end: number
      confidence: number
    }>
    selectedDocument: {
      id: string
      name: string
      status: string
      type: string
      documentUrl: string
    }
  }
  
  const props = withDefaults(defineProps<Props>(), {
    initialContent: '',
  })
  
  // Emits
  const emit = defineEmits<{
    (e: 'update:content', value: string): void
    (e: 'save', value: string): void
    (e: 'close'): void
    (e: 'launchOcr'): void
  }>()
  
  // State
  const editorContent = ref(props.initialContent)
  const selectedWord = ref<string | null>(null)
  const selectedSuggestion = ref<{ word: string; start: number; end: number } | null>(null)
  const dropdownPosition = ref<{ top: number; left: number } | null>(null)
  const editableTextRef = ref<HTMLElement | null>(null)
  const { toast } = useToast()
  const imageLoading = ref(true)
  const documentUrl = ref('')
  const localSuggestions = ref<Array<{
    word: string
    suggestions: string[]
    start: number
    end: number
    confidence: number
  }>>([])
  const isLoading = ref(false)
  const isHoveringDropdown = ref(false)
  const showActionMenu = ref(false)
  const errorCount = computed(() => localSuggestions.value.length)
  const startTime = ref<number>(0)
  const processingTime = ref<string>('0.00')
  const precision = ref<string>('0.00')
  const hasStartedOcr = ref(false)
  
  // Computed
  interface TextPart {
    text: string
    isSuggestion?: boolean
    word?: string
    start?: number
    end?: number
    confidence: number
  }
  
  const textParts = computed<TextPart[]>(() => {
    if (!editorContent.value || !localSuggestions.value.length) {
      return [{ text: editorContent.value || '', confidence: 1 }];
    }

    const parts: TextPart[] = [];
    let lastIndex = 0;
    const text = editorContent.value;

    // Debug: Print the full text
    console.log('🔍 [Debug] Full text:', text);

    const sortedSuggestions = [...localSuggestions.value].sort((a, b) => a.start - b.start);

    sortedSuggestions.forEach(suggestion => {
      // Debug: Print each suggestion's details
      console.log('🔍 [Debug] Suggestion:', {
        word: suggestion.word,
        start: suggestion.start,
        end: suggestion.end,
        textAtPosition: text.slice(suggestion.start, suggestion.end)
      });

      // Capture text before the incorrect word
      if (suggestion.start > lastIndex) {
        parts.push({ text: text.slice(lastIndex, suggestion.start), confidence: 1 });
      }

      // Add the incorrect word with its exact boundaries
      parts.push({
        text: text.slice(suggestion.start, suggestion.end),
        isSuggestion: true,
        word: suggestion.word,
        start: suggestion.start,
        end: suggestion.end,
        confidence: suggestion.confidence
      });

      lastIndex = suggestion.end;
    });

    // Capture remaining text after the last incorrect word
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), confidence: 1 });
    }

    // Debug: Print the final parts
    console.log('🔍 [Debug] Final parts:', parts.map(part => ({
      text: part.text,
      isSuggestion: part.isSuggestion,
      start: part.start,
      end: part.end
    })));

    return parts;
  });
  
  const dropdownStyle = computed<CSSProperties>(() => {
    if (!dropdownPosition.value) return {};

    return {
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`,
      position: 'absolute',
      zIndex: 50,
      background: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '0.25rem',
      borderRadius: '0.5rem',
      minWidth: '150px',
      maxWidth: '200px'
    };
  });

  // Add this helper function before the ocrResponse object
  const findWordPosition = (text: string, word: string): { start: number; end: number } => {
    const index = text.indexOf(word);
    if (index === -1) {
      console.warn(`Word "${word}" not found in text`);
      return { start: 0, end: 0 }; // Return default position if word not found
    }
    return {
      start: index,
      end: index + word.length
    };
  };

  const ocrResponse = {
    text: "يبدأ كل إنجاز بقرار المحاولة. رحلة الألف ميل تبدا بخطوه واحدة.",
    suggestions: [
      {
        word: "تبدا",
        suggestions: ["تبدأ", "يبدأ", "بدأ"],
        confidence: 0.85,
        ...findWordPosition("يبدأ كل إنجاز بقرار المحاولة. رحلة الألف ميل تبدا بخطوه واحدة.", "تبدا")
      },
      {
        word: "خطوه",
        suggestions: ["خطوة", "خطوات", "الخطوة"],
        confidence: 0.75,
        ...findWordPosition("يبدأ كل إنجاز بقرار المحاولة. رحلة الألف ميل تبدا بخطوه واحدة.", "خطوه")
      }
    ]
  };
  
  // Methods

  // Add this helper function to detect RTL text
  const isRTL = (text: string): boolean => {
    const rtlRegex = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlRegex.test(text);
  };

  const handleWordHover = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.dataset.word) {
      const word = target.dataset.word;
      const start = Number(target.dataset.start);
      const end = Number(target.dataset.end);
      const isRtlText = isRTL(word);

      selectedWord.value = word;
      selectedSuggestion.value = { word, start, end };

      // Get the position relative to the viewport
      const rect = target.getBoundingClientRect();
      
      // Get the position of the text area container
      const textAreaContainer = editableTextRef.value?.parentElement;
      const containerRect = textAreaContainer?.getBoundingClientRect();
      
      // Debug logging
      console.log('🔍 [Debug] Word hover details:', {
        word,
        isRTL: isRtlText,
        rectTop: rect.top,
        rectLeft: rect.left,
        rectRight: rect.right,
        rectWidth: rect.width,
        rectHeight: rect.height,
        containerTop: containerRect?.top,
        containerLeft: containerRect?.left,
        containerScroll: textAreaContainer ? {
          scrollTop: textAreaContainer.scrollTop,
          scrollLeft: textAreaContainer.scrollLeft
        } : null
      });
      
      if (containerRect && textAreaContainer) {
        // Calculate position relative to the text area container, accounting for scroll
        const top = rect.top - containerRect.top + textAreaContainer.scrollTop;
        // For RTL text, position from the right edge of the word
        const left = isRtlText 
          ? rect.right - containerRect.left - 200 // 200 is dropdown width
          : rect.left - containerRect.left;

        // Debug logging for position calculations
        console.log('🔍 [Debug] Position calculations:', {
          calculatedTop: top,
          calculatedLeft: left,
          wordHeight: rect.height,
          lineHeight: parseInt(getComputedStyle(target).lineHeight),
          isRTL: isRtlText
        });

        // Position the dropdown below the word with adjusted offset
        dropdownPosition.value = {
          top: top + rect.height + 5, // Add 5px padding
          left: Math.max(0, left) // Ensure left is never negative
        };

        // Get dropdown dimensions for boundary checks
        const dropdownHeight = 200;
        const dropdownWidth = 200;
        const containerHeight = textAreaContainer.clientHeight;
        const containerWidth = textAreaContainer.clientWidth;

        // Adjust position if dropdown would go outside container bounds
        if (dropdownPosition.value.left + dropdownWidth > containerWidth) {
          dropdownPosition.value.left = containerWidth - dropdownWidth - 10;
        }
        
        if (dropdownPosition.value.top + dropdownHeight > containerHeight) {
          dropdownPosition.value.top = top - dropdownHeight - 5;
        }

        // Ensure dropdown doesn't go above the container
        if (dropdownPosition.value.top < 0) {
          dropdownPosition.value.top = 5;
        }

        // Final position logging
        console.log('🔍 [Debug] Final dropdown position:', {
          top: dropdownPosition.value.top,
          left: dropdownPosition.value.left,
          isRTL: isRtlText
        });
      }
    }
  };

  const handleWordLeave = () => {
    // Add a small delay before hiding the dropdown to allow moving to it
    setTimeout(() => {
      if (!isHoveringDropdown.value) {
        selectedWord.value = null;
        dropdownPosition.value = null;
      }
    }, 100);
  };

  const renderedContent = computed(() => {
    if (!editorContent.value) {
      return 'Le texte extrait par OCR sera affiché ici...';
    }

    const isRtlText = isRTL(editorContent.value);
    const containerDir = isRtlText ? 'rtl' : 'ltr';
    
    // Wrap the entire content in a div with direction
    return `<div dir="${containerDir}" style="text-align: ${isRtlText ? 'right' : 'left'}">` +
      textParts.value.map((part) => {
        if (part.isSuggestion) {
          return `<span 
                    class="relative inline cursor-pointer ${getConfidenceClass(part.confidence)}" 
                    data-word="${part.word}" 
                    data-start="${part.start}" 
                    data-end="${part.end}"
                  >${part.text}</span>`;
        }
        return part.text;
      }).join('') +
    '</div>';
  });

  const startOcr = async () => {
    try {
      isLoading.value = true;
      startTime.value = performance.now();
      hasStartedOcr.value = true;

      // Simulate API delay (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      editorContent.value = ocrResponse.text;
      localSuggestions.value = ocrResponse.suggestions;

      // Calculate processing time
      const endTime = performance.now();
      processingTime.value = ((endTime - startTime.value) / 1000).toFixed(2);

      // Calculate precision based on confidence scores
      const avgConfidence = localSuggestions.value.reduce((acc, curr) => acc + curr.confidence, 0) / localSuggestions.value.length;
      precision.value = (avgConfidence * 100).toFixed(2);

      emit('update:content', ocrResponse.text);
      emit('launchOcr');
    } finally {
      isLoading.value = false;
    }
  };

  const syncEditorContent = () => {
    if (editableTextRef.value) {
      // Store current cursor position and selection
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      let cursorOffset = 0;
      
      // Calculate cursor offset from the start of the content
      if (range) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editableTextRef.value);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorOffset = preCaretRange.toString().length;
      }

      // Get the content while preserving line breaks
      const newText = editableTextRef.value.innerText;
      editorContent.value = newText;
      
      // Update suggestions positions after text changes
      localSuggestions.value = localSuggestions.value.map(suggestion => {
        const newPosition = findWordPosition(newText, suggestion.word);
        return {
          ...suggestion,
          start: newPosition.start,
          end: newPosition.end
        };
      }).filter(suggestion => suggestion.start !== 0 || suggestion.word === newText.slice(0, suggestion.word.length));

      // Emit the content update
      emit('update:content', newText);

      // Re-render with highlighting on next tick
      nextTick(() => {
        if (editableTextRef.value) {
          // Update the HTML with highlighted content while preserving line breaks
          editableTextRef.value.innerHTML = renderedContent.value;
          
          // Restore cursor position
          const selection = window.getSelection();
          const range = document.createRange();
          
          // Find the text node and offset where cursor should be placed
          let currentOffset = 0;
          let targetNode = null;
          let targetOffset = 0;
          
          const walk = document.createTreeWalker(
            editableTextRef.value,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while ((node = walk.nextNode())) {
            const nodeLength = node.textContent?.length || 0;
            if (currentOffset + nodeLength >= cursorOffset) {
              targetNode = node;
              targetOffset = cursorOffset - currentOffset;
              break;
            }
            currentOffset += nodeLength;
          }
          
          if (targetNode) {
            range.setStart(targetNode, targetOffset);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      });
    }
  };
  
  const getSuggestionsForWord = (word: string) => {
    const suggestion = localSuggestions.value.find(s => s.word === word)
    return suggestion?.suggestions || []
  }
  
  const applySuggestion = (newWord: string) => {
    if (!selectedSuggestion.value || !editableTextRef.value) return;

    const { start, end } = selectedSuggestion.value;
    const content = editorContent.value;
    
    // Replace the word in the content
    const updatedContent = content.slice(0, start) + newWord + content.slice(end);
    editorContent.value = updatedContent;

    // Update the suggestions list to remove the applied suggestion
    localSuggestions.value = localSuggestions.value.filter(s => 
      s.word !== selectedSuggestion.value?.word
    );

    // Recalculate precision
    if (localSuggestions.value.length > 0) {
      const avgConfidence = localSuggestions.value.reduce((acc, curr) => acc + curr.confidence, 0) / localSuggestions.value.length;
      precision.value = (avgConfidence * 100).toFixed(2);
    } else {
      precision.value = '100.00';
    }

    // Update the editor content while preserving HTML formatting
    nextTick(() => {
      if (editableTextRef.value) {
        editableTextRef.value.innerHTML = renderedContent.value;
      }
    });

    emit('update:content', updatedContent);
    selectedWord.value = null;
    dropdownPosition.value = null;
  };
  
  const ignoreSuggestion = () => {
    if (selectedSuggestion.value) {
      // Remove the suggestion from localSuggestions to remove the highlighting
      localSuggestions.value = localSuggestions.value.filter(s => 
        s.word !== selectedSuggestion.value?.word
      );
      
      // Recalculate precision
      if (localSuggestions.value.length > 0) {
        const avgConfidence = localSuggestions.value.reduce((acc, curr) => acc + curr.confidence, 0) / localSuggestions.value.length;
        precision.value = (avgConfidence * 100).toFixed(2);
      } else {
        precision.value = '100.00';
      }
      
      // Update the editor content to reflect the change
      nextTick(() => {
        if (editableTextRef.value) {
          editableTextRef.value.innerHTML = renderedContent.value;
        }
      });
    }
    selectedWord.value = null;
    dropdownPosition.value = null;
  }
  
  const getConfidenceClass = (confidence: number) => {
    return 'highlighted-word'
  }
  
  const handleSave = () => {
    emit('save', editorContent.value)
    toast({
      title: 'Succès',
      description: 'Modifications enregistrées avec succès.',
    })
  }
  
  // Watch for content updates
  watch(() => props.initialContent, (newContent) => {
    if (newContent !== undefined) {
      editorContent.value = newContent
    }
  })
  
  onMounted(async () => {
    if (props.selectedDocument) {
      try {
        const response = await documentsService.getFile(props.selectedDocument.id)
        if (response.data) {
          const blob = new Blob([response.data], { type: props.selectedDocument.type })
          documentUrl.value = URL.createObjectURL(blob)
        }
      } catch (error) {
        console.error('Error loading document:', error)
        
      }
    }
  })
  
  onUnmounted(() => {
    if (documentUrl.value) {
      URL.revokeObjectURL(documentUrl.value)
    }
  })

  const exportToDoc = () => {
    if (!editorContent.value) return;
    
    // Create a Blob with the content
    const blob = new Blob([editorContent.value], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.selectedDocument.name.split('.')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export réussi',
      description: 'Le document a été exporté au format DOC.',
    });
  };

  const exportToPdf = () => {
    if (!editorContent.value) return;
    
    try {
      // Create a new PDF document with proper margins
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font and size
      doc.setFont('helvetica');
      doc.setFontSize(12);
      
      // Set margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - (margin * 2);
      
      // Split the content into lines and add them to the PDF
      const lines = editorContent.value.split('\n');
      let y = margin; // Starting y position
      
      lines.forEach((line, index) => {
        // Split long lines into multiple lines if they exceed the page width
        const splitLines = doc.splitTextToSize(line, maxWidth);
        
        splitLines.forEach((splitLine: string) => {
          // Add text to the PDF with proper margins
          doc.text(splitLine, margin, y);
          
          // Move to next line
          y += 7;
          
          // Add new page if we're near the bottom
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
        });
      });
      
      // Save the PDF
      doc.save(`${props.selectedDocument.name.split('.')[0]}.pdf`);
      
      toast({
        title: 'Export réussi',
        description: 'Le document a été exporté au format PDF.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async () => {
    if (!editorContent.value) return;
    
    try {
      await navigator.clipboard.writeText(editorContent.value);
      toast({
        title: 'Copié',
        description: 'Le texte a été copié dans le presse-papiers.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le texte.',
        variant: 'destructive',
      });
    }
  };

  const toggleActionMenu = () => {
    showActionMenu.value = !showActionMenu.value
  }

  const summarizeText = () => {
    // TODO: Implement text summarization
    toast({
      title: 'Fonctionnalité à venir',
      description: 'Le résumé automatique sera bientôt disponible.',
    })
    showActionMenu.value = false
  }

  const checkGrammar = () => {
    // TODO: Implement grammar check
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La vérification grammaticale sera bientôt disponible.',
    })
    showActionMenu.value = false
  }

  const translateText = () => {
    // TODO: Implement translation
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La traduction sera bientôt disponible.',
    })
    showActionMenu.value = false
  }

  // Add click outside handler to close menu
  const closeActionMenu = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.floating-action-button')) {
      showActionMenu.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', closeActionMenu)
  })

  onUnmounted(() => {
    document.removeEventListener('click', closeActionMenu)
  })
  </script>
  
  <style>
  /* Update confidence level colors and add hover effect */
  .highlighted-word {
    background-color: rgba(239, 68, 68, 0.5);
    padding: 2px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .highlighted-word:hover {
    background-color: rgba(239, 68, 68, 0.3);
  }
  
  /* Add styles for the editable content area */
  [contenteditable="true"] {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    -webkit-user-modify: read-write-plaintext-only;
    line-height: 1.5;
    unicode-bidi: plaintext;
  }
  
  /* Add RTL support for the editable content */
  [contenteditable="true"][dir="rtl"] {
    text-align: right;
  }
  
  .suggestion-dropdown {
    position: absolute;
    background: white;
    border: 1px solid rgb(var(--border));
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
    z-index: 50;
    padding: 0.25rem;
    border-radius: 0.5rem;
    min-width: 150px;
    max-width: 200px;
  }
  
  .suggestion-item {
    display: block;
    width: 100%;
    padding: 0.5rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.875rem;
    border-radius: 0.25rem;
  }
  
  .suggestion-item:hover {
    background-color: rgb(var(--muted));
  }
  
  .suggestion-item > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Add RTL support for dropdown items */
  [dir="rtl"] .suggestion-item {
    text-align: right;
  }
  
  /* Ensure icon alignment in RTL */
  [dir="rtl"] .suggestion-item > div {
    flex-direction: row-reverse;
  }

  /* Update floating action button styles */
  .floating-action-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 50;
  }

  .floating-action-button:hover {
    transform: scale(1.05);
  }

  /* Update error badge animation */
  .error-badge {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { 
      opacity: 1;
      transform: scale(1);
    }
    50% { 
      opacity: 0.9;
      transform: scale(1.1);
    }
  }

  /* Add hover effect for menu items */
  .floating-action-button button:hover {
    transform: translateX(2px);
    transition: transform 0.2s ease;
  }
  </style>