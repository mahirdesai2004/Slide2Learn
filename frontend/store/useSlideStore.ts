import { create } from 'zustand';

export interface Slide {
    slide_no: number;
    title: string;
    points: string[];
    diagram_type: string;
    raw_text: string;
    category: string;
}

interface SlideState {
    slides: Slide[];
    currentSlideIndex: number;
    isLoading: boolean;
    filename: string | null;

    setSlides: (slides: Slide[], filename: string) => void;
    setCurrentSlideIndex: (index: number) => void;
    setIsLoading: (loading: boolean) => void;
}

export const useSlideStore = create<SlideState>((set) => ({
    slides: [],
    currentSlideIndex: -1,
    isLoading: false,
    filename: null,

    setSlides: (slides, filename) => set({ slides, filename, currentSlideIndex: 0 }),
    setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
    setIsLoading: (loading) => set({ isLoading: loading }),
}));
