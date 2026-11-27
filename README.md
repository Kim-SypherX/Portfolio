# Portfolio — Kim Josaphat YARGA

Portfolio 3D interactif : galaxie WebGL, globe de certifications autour de ma photo, projets animés en 3D au scroll et un **Lab** où l'on teste mes projets de vision par ordinateur directement dans le navigateur.

🔗 **Démo :** [kim-sypherx.github.io/Portfolio](https://kim-sypherx.github.io/Portfolio)

## ✨ Points forts

- **Hero Three.js** : galaxie de 14 000 particules qui réagit au curseur, noyau organique (shaders GLSL), travelling d'intro
- **Smooth scroll** (Lenis) + animations liées au scroll : entrée 3D des projets, parallaxe, marquee sensible à la vitesse
- **Globe de certifications** : 16 certificats en hélice sphérique autour de mon portrait détouré (CSS 3D piloté en JS)
- **Lab interactif** (webcam, 100 % local, WebAssembly + GPU) :
  - **Naruto** : Rasengan / Chidori par hand tracking (MediaPipe Hands)
  - **Dragon Ball Z** : charge + Kamehameha par pose tracking (MediaPipe Pose)
  - **Virtual Car Game** : jeu de course 3D complet, piloté à la main ou au clavier
  - Mode souris / clavier si aucune webcam n'est disponible

## 📂 Structure

```
Portfolio/
├── index.html            # Page principale
├── cv.html               # Version web du CV
├── styles.css            # Design system + animations
├── js/
│   ├── main.js           # Orchestration, smooth scroll, moteur de mouvement
│   ├── data.js           # Projets, certifications, technologies
│   ├── hero3d.js         # Scène Three.js du hero
│   ├── certs.js          # Globe des certifications
│   ├── sphere.js         # Nuage 3D de compétences
│   └── lab.js            # Démos webcam Naruto / DBZ + jeu embarqué
├── lab/virtual-car-game/ # Build Vite du jeu (généré, ne pas éditer)
└── assets/               # Images, certificats, vidéos d'effets, CV PDF
```

## 🛠️ Lancer en local

Les modules ES et la webcam imposent un serveur (pas d'ouverture en `file://`) :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

> La webcam ne fonctionne qu'en `https` ou sur `localhost`.

## 🔄 Mettre à jour le jeu Virtual Car Game

Depuis `../Virtual_Car_Game` :

```bash
npx vite build --base ./ --outDir ../Portfolio/lab/virtual-car-game --emptyOutDir
```

## 🧰 Technologies

HTML5 · CSS3 · JavaScript (ES modules, zéro framework) · Three.js · GLSL · Lenis · MediaPipe Tasks Vision · Canvas 2D
