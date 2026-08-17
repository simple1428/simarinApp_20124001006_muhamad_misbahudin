import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
        >
            <circle cx="20" cy="20" r="19" fill="#0B6E99" />

            <path
                d="M10 22H30L27 27H13L10 22Z"
                fill="white"
            />

            <path
                d="M14 22L16 15H25L28 22"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M18 15V11H23V15"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M21 11V9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
            />

            <path
                d="M8 30C10 28.5 12 28.5 14 30C16 31.5 18 31.5 20 30C22 28.5 24 28.5 26 30C28 31.5 30 31.5 32 30"
                stroke="white"
                stroke-width="1.8"
                stroke-linecap="round"
            />
        </svg>
    );
}
