import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/FISA-INFO-A3-S.I-DOCS/',
  title: "Documentation Projet XANADU",
  description: "Cartographie, Sécurité & Infrastructure",
  themeConfig: {
    search: {
      provider: 'local'
    },

    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Cartographie', link: '/cartographie/architecture-si' },
      { text: 'Sécurité', link: '/securite/politique-filtrage' },
      { text: 'Exploitation', link: '/scripts/gestion-quotidienne' }
    ],

    sidebar: [
      {
        text: '1. Cartographie & Infra',
        items: [
          { text: 'Architecture SI & Réseau', link: '/cartographie/architecture-si' },
          { text: 'Architecture Active Directory', link: '/cartographie/active-directory' },
          { text: 'Plan de Sauvegarde (3-2-1)', link: '/infra/sauvegarde' },
          { text: 'Matrice des Flux', link: '/cartographie/flux' }
        ]
      },
      {
        text: '2. Sécurité du SI',
        items: [
          { text: 'Questionnaire & Audit', link: '/securite/audit' },
          { text: 'Politique de Filtrage', link: '/securite/politique-filtrage' },
          { text: 'GPO & Durcissement', link: '/securite/gpo' },
          { text: 'Gestion des Identités (IAM)', link: '/securite/iam' },
          { text: 'CIDT (Confidentialité, Intégrité...)', link: '/securite/cidt' }
        ]
      },
      {
        text: 'Infrastructure',
        items: [
          { text: 'Plan d\'adressage', link: '/infra/adressage-ip' }
        ]
      },
      {
        text: 'Scripts',
        items: [
          { text: 'Introduction', link: '/scripts/introduction' }
        ]
      },
      {
        text: '3. Exploitation & Scripts',
        items: [
          { text: 'Scripts d\'administration', link: '/scripts/gestion-quotidienne' },
          { text: 'Supervision & Alerting', link: '/scripts/supervision' },
          { text: 'Procédures PRA/PCA', link: '/scripts/pra' }
        ]
      },
      {
        text: 'Gestion de Projet',
        items: [
          { text: 'Suivi & Planning', link: '/projet/suivi' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' }
    ],
    
    footer: {
      message: 'CESI - Projet XANADU - Promotion 2025',
      copyright: 'Copyright © 2025 Groupe 4'
    }
  }
})
