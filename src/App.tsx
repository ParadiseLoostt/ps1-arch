import { useEffect, useRef, useState } from 'react';
import {
  initScene,
  toggleAutoRotate,
  toggleWireframe,
  togglePS1,
  togglePS1Fps,
  takeScreenshot,
  setPose,
  applyPalette,
  setResolution,
  setCameraPreset,
} from './archer-scene';
import './archer.css';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotateOn, setAutoRotateOn] = useState(false);
  const [wireframeOn, setWireframeOn] = useState(false);
  const [ps1On, setPs1On] = useState(true);
  const [ps1FpsOn, setPs1FpsOn] = useState(false);
  const [currentPose, setCurrentPose] = useState('Idle');
  const [currentPalette, setCurrentPalette] = useState('Forest');
  const [currentRes, setCurrentRes] = useState('240p');

  useEffect(() => {
    if (containerRef.current) {
      initScene(containerRef.current);
    }
  }, []);

  const handleAutoRotate = () => {
    const state = toggleAutoRotate();
    setAutoRotateOn(state);
  };

  const handleWireframe = () => {
    const state = toggleWireframe();
    setWireframeOn(state);
  };

  const handlePS1 = () => {
    const state = togglePS1();
    setPs1On(state);
  };

  const handlePS1Fps = () => {
    const state = togglePS1Fps();
    setPs1FpsOn(state);
  };

  const handlePose = (pose: string) => {
    setPose(pose);
    setCurrentPose(pose);
  };

  const handlePalette = (palette: string) => {
    applyPalette(palette);
    setCurrentPalette(palette);
  };

  const handleResolution = (res: string) => {
    setResolution(res);
    setCurrentRes(res);
  };

  const handleView = (view: string) => {
    setCameraPreset(view);
  };

  return (
    <div className="app-container">
      {/* Three.js canvas container */}
      <div ref={containerRef} className="canvas-container" />

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Title */}
        <div className="ui-title">
          <span className="title-text">PS1 ARCHER GIRL</span>
          <span className="title-sub">Low-Poly Character Viewer</span>
        </div>

        {/* Controls Panel */}
        <div className="controls-panel">
          {/* Toggle buttons */}
          <div className="control-row">
            <button
              className={`retro-btn ${autoRotateOn ? 'active' : ''}`}
              onClick={handleAutoRotate}
            >
              Auto-Rotate [{autoRotateOn ? 'ON' : 'OFF'}]
            </button>
            <button
              className={`retro-btn ${wireframeOn ? 'active' : ''}`}
              onClick={handleWireframe}
            >
              Wireframe [{wireframeOn ? 'ON' : 'OFF'}]
            </button>
          </div>

          {/* Pose selection */}
          <div className="control-row">
            <span className="control-label">Pose:</span>
            {['Idle', 'Aim', 'Draw'].map((pose) => (
              <button
                key={pose}
                className={`retro-btn small ${currentPose === pose ? 'active' : ''}`}
                onClick={() => handlePose(pose)}
              >
                {pose}
              </button>
            ))}
          </div>

          {/* Palette selection */}
          <div className="control-row">
            <span className="control-label">Palette:</span>
            {['Forest', 'Desert', 'Night'].map((palette) => (
              <button
                key={palette}
                className={`retro-btn small ${currentPalette === palette ? 'active' : ''}`}
                onClick={() => handlePalette(palette)}
              >
                {palette}
              </button>
            ))}
          </div>

          {/* View presets */}
          <div className="control-row">
            <span className="control-label">View:</span>
            {['Front', 'Side', 'Back', 'Top', 'Reset'].map((view) => (
              <button
                key={view}
                className="retro-btn small"
                onClick={() => handleView(view.toLowerCase())}
              >
                {view}
              </button>
            ))}
          </div>

          {/* PS1 FX & Resolution */}
          <div className="control-row">
            <button
              className={`retro-btn ${ps1On ? 'active' : ''}`}
              onClick={handlePS1}
            >
              PS1 FX [{ps1On ? 'ON' : 'OFF'}]
            </button>
            <button
              className={`retro-btn ${ps1FpsOn ? 'active' : ''}`}
              onClick={handlePS1Fps}
            >
              PS1 FPS [{ps1FpsOn ? 'ON' : 'OFF'}]
            </button>
          </div>

          {/* Resolution */}
          <div className="control-row">
            <span className="control-label">Res:</span>
            {['240p', '360p', '480p'].map((res) => (
              <button
                key={res}
                className={`retro-btn small ${currentRes === res ? 'active' : ''}`}
                onClick={() => handleResolution(res)}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Screenshot */}
          <div className="control-row">
            <button className="retro-btn" onClick={takeScreenshot}>
              📸 Screenshot
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="info-panel">
          <div id="triangle-counter" className="triangle-counter">
            Triangles: 0
          </div>
          <div className="hint-text">
            Left-drag: orbit | Wheel: zoom | Right-drag: pan
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
