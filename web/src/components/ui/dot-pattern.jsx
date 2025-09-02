export default function DotPattern() {
    return (
        <div className="absolute top-0 size-full text-muted">
            <svg aria-hidden="true" className="dotsPattern">
                <defs>
                    <pattern
                        id="dot-pattern"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                        patternContentUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                    >
                        <circle
                            id="pattern-circle"
                            cx="1"
                            cy="1"
                            r="1"
                            fill="currentColor"
                        ></circle>
                    </pattern>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    strokeWidth="0"
                    fill="url(#dot-pattern)"
                ></rect>
            </svg>
            <div className="absolute bottom-0 h-[30dvh] w-full bg-gradient-to-t from-background"></div>
        </div>
    );
}
