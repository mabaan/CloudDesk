export function AnimatedBackground() {
    return (
        <div className="animated-background">
            {/* Grid Pattern */}
            <div className="bg-grid" />

            {/* Floating Orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Particles */}
            <div className="particles">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>
        </div>
    );
}
