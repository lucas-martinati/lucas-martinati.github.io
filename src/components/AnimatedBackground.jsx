export default function AnimatedBackground() {
    return (
        <div className="animated-bg" aria-hidden="true">
            {/* Tech Blueprint Matrix Grid Overlay (statique, sans blobs animés) */}
            <div className="tech-grid-overlay"></div>

            {/* Vignette mask */}
            <div className="bg-vignette"></div>
        </div>
    );
}
