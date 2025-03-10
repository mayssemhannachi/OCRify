<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  FileText,
  ChevronRight,
  Search,
  MessageSquare,
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import SidebarLeft from '@/components/SidebarLeft.vue'
import { Button } from '@/components/ui/button'

const searchQuery = ref('')

const faqs = [
  {
    question: "Comment importer un document ?",
    answer: "Vous pouvez importer un document en le glissant-déposant dans la zone prévue à cet effet ou en cliquant sur le bouton 'Importer' pour sélectionner un fichier depuis votre ordinateur."
  },
  {
    question: "Quels formats de fichiers sont supportés ?",
    answer: "L'application prend en charge les formats PDF, PNG, JPG et JPEG. La taille maximale par fichier est de 10 Mo."
  },
  {
    question: "Comment fonctionne l'OCR ?",
    answer: "L'OCR (Reconnaissance Optique de Caractères) analyse les images et les PDF pour en extraire le texte. La qualité de la reconnaissance dépend de la qualité du document original."
  },
  {
    question: "Où sont stockés mes documents ?",
    answer: "Vos documents sont stockés de manière sécurisée sur nos serveurs. Vous pouvez gérer vos documents dans la section 'Documents' et configurer les paramètres de stockage dans 'Paramètres'."
  }
]

const guides = [
  {
    title: "Guide de démarrage",
    description: "Apprenez les bases de l'application",
    icon: Book
  },
  {
    title: "Tutoriels vidéo",
    description: "Regardez nos tutoriels pas à pas",
    icon: FileText
  },
  {
    title: "Centre d'aide",
    description: "Parcourez notre documentation détaillée",
    icon: HelpCircle
  },
  {
    title: "Contactez-nous",
    description: "Obtenez de l'aide personnalisée",
    icon: MessageCircle
  }
]

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  )
})
</script>

<template>
  <SidebarProvider>
    <SidebarLeft />
    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div class="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Aide</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-6 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Centre d'aide</h1>
            <p class="text-muted-foreground mt-1">Trouvez des réponses à vos questions</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid gap-6">
          <!-- Search Section -->
          <Card>
            <CardContent class="pt-6">
              <div class="flex items-center gap-2">
                <Search class="h-4 w-4 text-muted-foreground" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher une question..."
                  class="flex-1 bg-transparent border-none focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <!-- FAQ Section -->
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
              <CardDescription>Les questions les plus posées par nos utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="faq in filteredFaqs" :key="faq.question" class="space-y-2">
                  <h3 class="font-medium">{{ faq.question }}</h3>
                  <p class="text-sm text-muted-foreground">{{ faq.answer }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Contact Section -->
          <Card>
            <CardHeader>
              <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
              <CardDescription>Notre équipe est là pour vous aider</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4">
                <Button variant="outline" class="w-full justify-start">
                  <Mail class="h-4 w-4 mr-2" />
                  Nous contacter par email
                </Button>
                <Button variant="outline" class="w-full justify-start">
                  <MessageSquare class="h-4 w-4 mr-2" />
                  Chat en direct
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template> 