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
      { text: 'Sécurité', link: '/securite/iam' },
      { text: 'Exploitation', link: '/scripts/introduction' }
    ],

    sidebar: [
      {
        text: '1. Cartographie & Infrastructure',
        collapsed: false,
        items: [
          { text: 'Architecture SI & Réseau', link: '/cartographie/architecture-si' },
          { text: 'Architecture Active Directory', link: '/cartographie/active-directory' },
          { text: 'Plan d\'adressage IP', link: '/infra/adressage-ip' },
          { text: 'Plan de Sauvegarde (3-2-1)', link: '/infra/sauvegarde' },
          { text: 'Matrice des Flux', link: '/cartographie/flux' }
        ]
      },
      {
        text: '2. Sécurité du SI',
        collapsed: false,
        items: [
          { text: 'Gestion des Identités (IAM)', link: '/securite/iam' },
          { text: 'GPO & Durcissement', link: '/securite/gpo' },
          { text: 'Politique de Filtrage', link: '/securite/politique-filtrage' },
          { text: 'Questionnaire & Audit', link: '/securite/audit' },
          { text: 'CIDT (Confidentialité, etc.)', link: '/securite/cidt' }
        ]
      },
      {
        text: '3. Exploitation & Scripts',
        collapsed: false,
        items: [
          { text: 'Introduction aux Scripts', link: '/scripts/introduction' },
          { text: 'Supervision & Alerting', link: '/scripts/supervision' },
          { text: 'Procédures PRA/PCA', link: '/scripts/pra' },
          {
            text: 'Scripts PowerShell',
            collapsed: true,
            items: [
              { text: 'Onboarding Utilisateur', link: '/scripts/ps-onboarding-user' },
              { text: 'Offboarding Utilisateur', link: '/scripts/ps-offboarding-user' },
              { text: 'Audit Comptes Inactifs', link: '/scripts/ps-audit-comptes' },
              { text: 'Sauvegarde GPO', link: '/scripts/ps-backup-gpo' },
              { text: 'Rapport Permissions NTFS', link: '/scripts/ps-rapport-ntfs' },
              { text: 'Déploiement Logiciel', link: '/scripts/ps-deploy-software' },
              { text: 'Nettoyage Profils', link: '/scripts/ps-clean-profiles' },
            ]
          },
          {
            text: 'Scripts Bash',
            collapsed: true,
            items: [
              { text: 'Sauvegarde Laboratoire', link: '/scripts/bash-backup-lab' },
              { text: 'Surveillance Système', link: '/scripts/bash-check-health' },
              { text: 'Rotation des Logs', link: '/scripts/bash-rotate-logs' },
            ]
          }
        ]
      },
      {
        text: 'Gestion de Projet',
        collapsed: false,
        items: [
          { text: 'Suivi & Planning', link: '/projet/suivi' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mr22206/FISA-INFO-A3-S.I-DOCS' }
    ],
    
    footer: {
      message: 'CESI - Projet XANADU - Promotion 2025',
      copyright: 'Copyright © 2025 Groupe 4'
    }
  }
})
