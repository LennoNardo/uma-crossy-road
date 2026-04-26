# 🚦 Uma Crossing

![Game Preview](https://img.shields.io/badge/Status-Prototype-orange)
![Three.js](https://img.shields.io/badge/Three.js-Black?style=flat&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)

**Uma Crossing** is a 3D endless hopper arcade game heavily inspired by the mechanics and voxel aesthetics of the original **Crossy Road**. 

## 🤖 The "Antigravity" AI Experiment

The primary motivation behind this project was not just to build a game, but to **test the limits of AI-assisted development**. 

This project was specifically created to explore the capabilities of the **Antigravity AI Agent**. While AI coding agents are typically utilized to scaffold standard 2D web applications (like CRUD apps, landing pages, and dashboards), this repository serves as a sandbox experiment to answer the question: 

> *"How far can an AI Agent go in building a fully functional, logic-heavy 3D game engine directly in the browser?"*

Through this project, we explored the AI's ability to handle complex 3D mathematics, lighting, camera manipulation, model rendering (`.glb`), and game loop optimization (`requestAnimationFrame`) outside of its usual comfort zone.

### 🚧 Challenges & The Reality of AI Game Dev

While the end result is functional, the development process highlighted the current realities and limitations of AI-assisted coding:

* **Heavy Prompt Engineering:** Building a 3D game with AI is far from a "one-click" magic trick. It required a *massive* amount of detailed, highly specific, and iterative prompting. Debugging visual glitches, fixing camera angles, and stabilizing the render loop required constant back-and-forth communication with the AI.
* **Limitations of UI Design AIs:** I initially attempted to use Google Stitch AI to prototype the web-based UI overlays for the game. However, it wasn't very helpful for a Three.js context—often hallucinating 3D landscape images instead of generating functional HTML/CSS wireframes. 
* **Total Reliance on Antigravity:** Because other tools failed to grasp the context of an HTML overlay sitting on top of a 3D canvas, the heavy lifting for both the complex game logic and the UI fixes ultimately relied almost entirely on the Antigravity AI Agent.

## 🎮 Gameplay Features
- **Endless Procedural World:** Infinite generation of roads, rivers, and safe zones.
- **Voxel Art Style:** Clean, retro 8-bit aesthetic utilizing modern web rendering.
- **Dynamic Obstacles:** Avoid moving vehicles and hop onto floating logs.
- **Character Selection:** Choose between different characters with unique `.glb` models.
- **Responsive UI:** Pixel-art HTML/CSS overlay synced with the 3D canvas, complete with high-score tracking.

## 🛠️ Tech Stack
- **[Three.js](https://threejs.org/):** Core 3D library for rendering the world, models, and lighting.
- **[Vite](https://vitejs.dev/):** Next-generation frontend tooling for lightning-fast HMR and optimized building.
- **HTML/CSS:** Used for the responsive, retro-styled UI overlays (Score, Menus, Game Over screens).
- **Vanilla JavaScript:** Handling the game state, logic, and physics without relying on heavy game engines like Unity or Godot.

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LennoNardo/uma-crossy-road.git
   cd uma-crossy-road

2. Install dependencies:
    ```bash
   npm install

3. Run the development server:
   ```bash
   npm run dev
   
4. Play the game:
   Open your browser and navigate to the local host URL provided in your terminal (usually http://localhost:5173).

🕹️ Controls

Desktop: Use the Arrow Keys (Up, Down, Left, Right) or W, A, S, D to hop around.
Mobile: Tap the on-screen D-Pad to move.

📜 Credits & Acknowledgments

Inspired by the original Crossy Road by Hipster Whale.
Developed as an AI pairing experiment using the Antigravity AI Agent.
Font: Press Start 2P via Google Fonts.
