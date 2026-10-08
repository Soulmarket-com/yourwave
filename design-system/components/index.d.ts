import type * as React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'md' | 'lg'; href?: string }
export declare function Button(props: ButtonProps): React.ReactElement;
export type Discipline = 'breathwork' | 'meditacion' | 'coaching' | 'cometa' | 'surf';
export interface BadgeProps { tone?: 'neutral' | Discipline; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface SessionCardProps { title: string; disciplines?: Discipline[]; meta?: string; description?: string; price?: string; image?: string; imageAlt?: string; actionLabel?: string; href?: string; onAction?: () => void }
export declare function SessionCard(props: SessionCardProps): React.ReactElement;
export interface WaveDividerProps { from?: string; to?: string; back?: string; height?: number; flip?: boolean; layered?: boolean }
export declare function WaveDivider(props: WaveDividerProps): React.ReactElement;
export interface TestimonialProps { quote: string; name: string; detail?: string; photo?: string }
export declare function Testimonial(props: TestimonialProps): React.ReactElement;
export interface FaqItemProps { question: string; defaultOpen?: boolean; children: React.ReactNode }
export declare function FaqItem(props: FaqItemProps): React.ReactElement;
declare global { interface Window { YourWave: { Button: typeof Button; Badge: typeof Badge; SessionCard: typeof SessionCard; WaveDivider: typeof WaveDivider; Testimonial: typeof Testimonial; FaqItem: typeof FaqItem } } }
