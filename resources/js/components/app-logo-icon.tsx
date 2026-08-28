import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            {...props}
        >
            <defs>
                {/* Background Gradient */}
                <linearGradient id="simarinBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>

                {/* Ship Hull Gradient */}
                <linearGradient id="simarinHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                {/* Neon Accent Glow */}
                <linearGradient id="simarinAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="simarinGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Rounded Hexagon / Shield Base */}
            <rect
                x="4"
                y="4"
                width="92"
                height="92"
                rx="24"
                fill="url(#simarinBgGrad)"
            />

            {/* Outer Subtle Glass Ring */}
            <rect
                x="4"
                y="4"
                width="92"
                height="92"
                rx="24"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="2"
            />

            {/* Futuristic Radar / Navigation Arc Waves */}
            <path
                d="M26 30 C 40 18, 60 18, 74 30"
                stroke="url(#simarinAccentGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
            />
            <path
                d="M33 36 C 43 28, 57 28, 67 36"
                stroke="url(#simarinAccentGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
            />

            {/* Beacon Pulse Dot */}
            <circle cx="50" cy="22" r="3.5" fill="#38bdf8" filter="url(#simarinGlow)" />

            {/* Sleek Modern Vessel Superstructure (Cabin/Bridge) */}
            <path
                d="M44 42 L56 42 L53 35 L47 35 Z"
                fill="#ffffff"
                opacity="0.95"
            />
            <path
                d="M42 47 L58 47 L56 42 L44 42 Z"
                fill="#cbd5e1"
            />

            {/* Modern Aerodynamic Ship Hull */}
            <path
                d="M20 54 L80 54 L71 67 C 62 72, 38 72, 29 67 Z"
                fill="url(#simarinHullGrad)"
                filter="url(#simarinGlow)"
            />

            {/* Hull Prow Dynamic Accent Stripe */}
            <path
                d="M24 57 L76 57 L73 62 C 64 66, 36 66, 27 62 Z"
                fill="#0284c7"
            />

            {/* Speed Waves at Bottom (Hydrofoil Dynamic Water Lines) */}
            <path
                d="M16 75 C 26 71, 38 78, 50 74 C 62 70, 74 77, 84 73"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
            />
            <path
                d="M24 83 C 34 80, 44 85, 54 82 C 64 79, 72 84, 78 81"
                stroke="#67e8f9"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
            />
        </svg>
    );
}
