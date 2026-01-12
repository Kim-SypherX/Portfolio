# Portfolio 3D Interactif

Portfolio ultra-haut de gamme avec environnement 3D WebGL, effets cyberpunk et animations cinématiques.

## 🚀 Démo en Direct

Visitez le portfolio : [https://kim-sypherx.github.io/Portfolio](https://kim-sypherx.github.io/Portfolio)

## ✨ Caractéristiques

- **Environnement 3D complet** avec Three.js et WebGL
- **Shaders personnalisés** (glitch, hologramme, néon)
- **Curseur personnalisé** avec effets magnétiques et traînée lumineuse
- **9 catégories de compétences** complètes
- **6 projets réels** présentés
- **Animations fluides** avec physique de ressort
- **Design cyberpunk** avec glassmorphisme et néons

## 🛠️ Technologies

- HTML5, CSS3, JavaScript (ES6+)
- Three.js pour le rendu 3D
- GLSL pour les shaders personnalisés
- Vanilla JS (zéro dépendance framework)

## 📂 Structure

```
Portfolio/
├── index.html              # Page principale
├── styles.css              # Système de design CSS
├── js/
│   ├── main.js            # Coordinateur d'application
│   ├── scene.js           # Gestionnaire de scène Three.js
│   ├── animations.js      # Contrôleur d'animations
│   ├── cursor.js          # Système de curseur personnalisé
│   ├── loader.js          # Écran de chargement
│   ├── hero.js            # Section héro 3D
│   ├── about.js           # Section à propos
│   ├── skills.js          # Section compétences
│   ├── projects.js        # Section projets
│   ├── contact.js         # Section contact
│   ├── utils.js           # Fonctions utilitaires
│   └── shaders/
│       ├── glitch.js      # Shader glitch
│       ├── hologram.js    # Shader hologramme
│       └── neon.js        # Shader néon
└── assets/
    └── images/            # Images des projets
```

## 🚀 Déploiement Local

1. Clonez le repository :
```bash
git clone https://github.com/Kim-SypherX/Portfolio.git
cd Portfolio
```

2. Ouvrez `index.html` dans un navigateur moderne

Ou utilisez un serveur local :
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

## 🎨 Personnalisation

### Modifier les informations personnelles
Éditez `index.html` pour mettre à jour :
- Nom et titre (lignes 70-71)
- Sections About, Skills, Projects
- Liens de contact

### Changer les couleurs
Modifiez les variables CSS dans `styles.css` (lignes 10-30) :
```css
--color-neon-cyan: #00f0ff;
--color-neon-magenta: #ff00ff;
--color-neon-purple: #b000ff;
```

### Ajouter des projets
1. Ajoutez l'image dans `assets/images/`
2. Ajoutez une carte de projet dans `index.html` (section projets)
3. Mettez à jour `js/projects.js` si nécessaire

## 📱 Compatibilité

- Chrome 90+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅
- Safari 14+ ✅

**Requis** : WebGL, ES6+, CSS Grid, Backdrop-filter

## 📄 Licence

Ce portfolio est un projet personnel. Libre d'utilisation pour inspiration.

## 👤 Auteur

**Yempounti Kim Josaphat Geoffroi YARGA**  
Développeur Full-Stack / Creative Technologist

---

© 2026 Yempounti Kim Josaphat Geoffroi YARGA. Élite par conception.
